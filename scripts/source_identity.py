"""Conservative external identities; never derive a provider key from specimen IDs."""
import re
from urllib.parse import parse_qs, urlsplit


def source_identity(url, label='', *, provider=None, record_id=None):
    parsed = urlsplit(url)
    host = (parsed.hostname or '').lower().removeprefix('www.')
    domains = {
        'zeno.ru': 'Zeno', 'cngcoins.com': 'CNG', 'numista.com': 'Numista',
        'sogdcoins.narod.ru': 'Coins of Central Asia', 'sogdcoins.ancients.info': 'Coins of Central Asia',
        'bactrianumis.com': 'Bactrianumis', 'sixbid.com': 'Sixbid',
        'numisbids.com': 'NumisBids', 'biddr.com': 'Biddr', 'sarc.auction': 'Stephen Album',
    }
    detected = next((name for domain, name in domains.items()
                     if host == domain or host.endswith('.' + domain)), host or 'external')
    if provider is not None and provider != detected:
        raise ValueError(f'Provider/URL mismatch: {provider}, {url}')
    provider = detected
    original = None
    if provider == 'Zeno' and parsed.path == '/showphoto.php':
        values = parse_qs(parsed.query).get('photo', [])
        if len(values) == 1 and re.fullmatch(r'[0-9]+', values[0]):
            original = values[0]
    elif provider == 'CNG':
        match = re.match(r'^/lots/view/([^/]+)(?:/|$)', parsed.path)
        if match:
            original = match[1]
    elif provider == 'Numista':
        match = re.fullmatch(r'/(?:catalogue/pieces)?([0-9]+)(?:\.html)?/?', parsed.path)
        if match:
            original = match[1]
    elif provider == 'Stephen Album':
        match = re.search(r'_i([0-9]+)/?$', parsed.path)
        if match:
            original = match[1]
    elif provider == 'NumisBids':
        match = re.fullmatch(r'/sale/([0-9]+)/lot/([0-9]+)/?', parsed.path)
        if match:
            original = 'sale/' + match[1] + '/lot/' + match[2]
    elif provider == 'Bactrianumis':
        match = re.fullmatch(r'Bactrianumis, product ([0-9]+)', label)
        if match:
            original = match[1]
    if record_id is not None:
        # Only caller-supplied source metadata may use this parameter.
        explicit = str(record_id)
        if not explicit or (provider == 'Zeno' and not re.fullmatch(r'[0-9]+', explicit)):
            raise ValueError(f'Invalid original record ID for {provider}: {explicit}')
        if original is not None and original != explicit:
            raise ValueError(f'Conflicting original record IDs: {url}, {explicit}')
        original = explicit
    if original is None:
        # URL-scoped holding key, explicitly NOT an inferred original ID.
        return provider, 'unresolved-url:' + url, 'pending_resolution'
    return provider, original, 'resolved'
