"""Build a bilingual static homepage with only the Python standard library."""
import json
import re
from html import escape
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]


def e(value):
    return escape(str(value), quote=True)


def bi(value):
    if not isinstance(value, dict) or not all(k in value for k in ('zh', 'en')):
        raise ValueError(f'Chinese and English text required: {value!r}')
    return f'<span lang="zh-CN">{e(value["zh"])}</span><span lang="en">{e(value["en"])}</span>'


def url(value):
    if urlparse(value).scheme not in ('https', 'http'):
        raise ValueError(f'Expected an HTTP(S) URL: {value}')
    return e(value)


def ordered(items):
    for item in items:
        date = item.get('sortDate', '')
        if date and not re.fullmatch(r'\d{4}-(0[1-9]|1[0-2])', date):
            raise ValueError(f'Use YYYY-MM for sortDate: {date}')
    return sorted(items, key=lambda x: (x.get('ongoing', False), x.get('sortDate', '')), reverse=True)


def build():
    data = json.loads((ROOT / 'content/site.json').read_text())
    p = data['profile']
    if not (ROOT / p['photo']).is_file():
        raise ValueError('Profile photo is missing')
    projects = []
    ids = set()
    for item in ordered(data['projects']):
        if not item.get('visible', True):
            continue
        if not re.fullmatch(r'[a-z0-9-]+', item['id']) or item['id'] in ids:
            raise ValueError('Project IDs must be unique lowercase slugs')
        ids.add(item['id'])
        tags = ''.join(f'<li>{e(t)}</li>' for t in item.get('tags', []))
        link = f'<a class="project-link" href="{url(item["url"])}">GitHub <span aria-hidden="true">↗</span></a>' if item.get('url') else ''
        projects.append(f'''<article class="project" id="{item['id']}">
          <div class="project-meta"><span>{bi(item['date'])}</span><span class="category">{bi(item['category'])}</span></div>
          <h3>{bi(item['title'])}</h3><p>{bi(item['description'])}</p>
          <div class="project-bottom"><ul class="tags" aria-label="Technologies">{tags}</ul>{link}</div>
        </article>''')
    current_items = []
    for item in ordered(data['currently']):
        title = (f'<a href="{url(item["url"])}">{bi(item["title"])}<span aria-hidden="true"> ↗</span></a>'
                 if item.get('url') else f'<strong class="current-title">{bi(item["title"])}</strong>')
        current_items.append(f'''<li><span class="current-dot" aria-hidden="true"></span><div>
          {title}<p>{bi(item['description'])}</p></div></li>''')
    current = ''.join(current_items)
    experience = ''.join(f'''<article class="experience-item"><p class="date">{bi(item['date'])}</p>
      <div><h3>{bi(item['company'])}<span class="job-role">{bi(item['role'])}</span></h3>
      <p>{bi(item['description'])}</p></div></article>''' for item in ordered(data['experience']))
    interests = ' · '.join(e(t) for t in p['interests'])
    replacements = {
        'NAME': bi(p['name']), 'ROLE': bi(p['role']), 'DEGREE': bi(p['degree']),
        'EDUCATION': bi(p['education']), 'INTRO': bi(p['intro']), 'PHOTO': e(p['photo']),
        'EMAIL': e(p['email']), 'GITHUB': url(p['github']), 'INTERESTS': interests,
        'CURRENT': current, 'PROJECTS': '\n'.join(projects), 'EXPERIENCE': experience,
        'TITLE_ZH': e(p['name']['zh']), 'TITLE_EN': e(p['name']['en']),
        'DESCRIPTION_ZH': e(p['intro']['zh']), 'DESCRIPTION_EN': e(p['intro']['en'])
    }
    html = (ROOT / 'template.html').read_text()
    for key, value in replacements.items():
        html = html.replace('{{' + key + '}}', value)
    if re.search(r'\{\{[A-Z_]+\}\}', html):
        raise ValueError('Unresolved template field')
    (ROOT / 'index.html').write_text(html)
    print(f'Built index.html: {len(projects)} projects, Chinese + English')


if __name__ == '__main__':
    build()
