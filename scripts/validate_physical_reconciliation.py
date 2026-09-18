"""Check overlay integrity and complete logical reversibility against the T04 export."""
import itertools
import json
from physical_reconciliation import validate_plan, verify_t04, stable_id


def validate_physical_reconciliation(root, db):
    verify_t04(db, root)  # All 38 old tables, complete rows/IDs, not just aggregate counts.
    plan = json.loads((root / 'research/physical-reconciliation.json').read_text())
    known = {r[0] for r in db.execute('SELECT id FROM specimen')}
    decisions = validate_plan(root, plan, known)
    db_decisions = {(a,b):status for a,b,status in db.execute('SELECT specimen_id_a,specimen_id_b,status FROM reconciliation_assertions')}
    assert db_decisions == {pair:a['status'] for pair,a in decisions.items()}
    assert not db.execute('SELECT specimen_id FROM physical_specimen_group_members GROUP BY specimen_id HAVING count(*)>1').fetchall()
    groups = [r[0] for r in db.execute('SELECT physical_group_id FROM physical_specimen_groups')]
    for gid in groups:
        members = sorted(r[0] for r in db.execute('SELECT specimen_id FROM physical_specimen_group_members WHERE physical_group_id=?',(gid,)))
        assert len(members)>=2 and gid==stable_id('physical-',members)
        expected = set()
        for pair in itertools.combinations(members,2):
            assert db_decisions.get(pair)=='confirmed_same'
            expected.add(stable_id('assertion-',pair))
        actual = {r[0] for r in db.execute('SELECT assertion_id FROM physical_group_assertions WHERE physical_group_id=?',(gid,))}
        assert actual==expected
    assert len(groups)==len(plan['groups'])
    assert not db.execute('PRAGMA foreign_key_check').fetchall()
    # No legacy rows are touched: remove only overlay contents inside a savepoint.
    db.execute('SAVEPOINT revoke_t05')
    for table in ('physical_group_assertions','physical_specimen_group_members',
                  'physical_specimen_groups','reconciliation_assertions','reconciliation_candidates'):
        db.execute('DELETE FROM '+table)
    verify_t04(db,root)
    assert not db.execute('PRAGMA foreign_key_check').fetchall()
    db.execute('ROLLBACK TO revoke_t05')
    db.execute('RELEASE revoke_t05')
    statuses = dict(db.execute('SELECT status,count(*) FROM reconciliation_decisions GROUP BY status'))
    members = db.execute('SELECT count(*) FROM physical_specimen_group_members').fetchone()[0]
    surplus = members-len(groups)
    print('T05 statuses:',statuses,'confirmed groups:',len(groups),'participating records:',members,
          'confirmed surplus:',surplus,'derived conservative count:',len(known)-surplus)
    print('T05 review pairs:',db.execute('SELECT specimen_id_a,specimen_id_b,status FROM reconciliation_decisions ORDER BY specimen_id_a,specimen_id_b').fetchall())
    print('T05 PASS: all 38 T04 table fingerprints unchanged; overlay revocation restores baseline; group evidence, pair conflicts and foreign keys checked')
