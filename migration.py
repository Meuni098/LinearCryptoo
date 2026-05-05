import sys, re, os

with open('home.md', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Extract pieces
head_match = re.search(r'<head\b[^>]*>(.*?)</head>', content, re.DOTALL)
head_content = head_match.group(1) if head_match else ''
fonts_match = re.search(r'<link href=.https://fonts.googleapis.com/css2[^\>]+>', head_content)
fonts = fonts_match.group(0) if fonts_match else ''

style_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
styles_css = style_match.group(1) if style_match else ''

body_match = re.search(r'<body\b[^>]*>(.*?)</body>', content, re.DOTALL)
body_content = body_match.group(1) if body_match else ''

mobile_menu_match = re.search(r'(<div class=.mobile-menu.*?</nav>)', body_content, re.DOTALL)
mobile_menu = mobile_menu_match.group(1) if mobile_menu_match else ''

main_match = re.search(r'<main>(.*?)</main>', body_content, re.DOTALL)
main_content = main_match.group(1) if main_match else ''

footer_match = re.search(r'(<footer>.*?</footer>)', body_content, re.DOTALL)
footer_content = footer_match.group(1) if footer_match else ''

script_match = re.search(r'<script>(.*?)</script>', body_content, re.DOTALL)
script_content = script_match.group(1) if script_match else ''

# Modify links for routing
main_content = main_content.replace('href="#" class="btn-primary">Open the Lab', 'href="#/end-to-end" class="btn-primary">Open the Lab')
main_content = main_content.replace('href="#" class="btn-cta">Open Lab', 'href="#/end-to-end" class="btn-cta">Open Lab')
main_content = main_content.replace('href="#" class="btn-primary">Open LinearCrypt Lab', 'href="#/end-to-end" class="btn-primary">Open LinearCrypt Lab')
mobile_menu = mobile_menu.replace('href="#" class="mobile-cta">Open the Lab', 'href="#/end-to-end" class="mobile-cta">Open the Lab')
mobile_menu = mobile_menu.replace('href="#" class="nav-logo"', 'href="#/" class="nav-logo"')
mobile_menu = mobile_menu.replace('href="#" class="btn-cta">Open Lab', 'href="#/end-to-end" class="btn-cta">Open Lab')

# 2. Update js/ui/landing.js
landing_js = '''// ============================================================
// LinearCrypt — Landing / Welcome Page
// ============================================================
window.LC = window.LC || {};
LC.Landing = {};

LC.Landing.render = function(container) {
  container.innerHTML = `
''' + main_content.replace('`', '\\`') + '''
  `;

  // Wait a tick for DOM to update
  setTimeout(() => {
''' + script_content.replace('`', '\\`') + '''
  }, 100);
};
'''
with open('js/ui/landing.js', 'w', encoding='utf-8') as f:
    f.write(landing_js)

# 3. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace fonts 
html = re.sub(r'<link href=\"https://fonts.googleapis.com/css2[^\"]+\" rel=\"stylesheet\">', fonts, html)

# Replace navbar
html = re.sub(r'<!-- ===== NAVBAR ===== -->.*?<!-- ===== MAIN APP CONTAINER ===== -->', 
              '<!-- ===== NAVBAR ===== -->\n' + mobile_menu + '\n\n  <!-- ===== MAIN APP CONTAINER ===== -->', 
              html, flags=re.DOTALL)

# Replace footer
html = re.sub(r'<!-- ===== FOOTER ===== -->.*?<!-- ===== APP SCRIPTS', 
              '<!-- ===== FOOTER ===== -->\n' + footer_content + '\n\n  <!-- ===== APP SCRIPTS', 
              html, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

# 4. Update styles.css
with open('css/styles.css', 'r', encoding='utf-8') as f:
    curr_styles = f.read()
if '/* ===== IMPORTED HOME.MD CSS ===== */' not in curr_styles:
    with open('css/styles.css', 'a', encoding='utf-8') as f:
        f.write('\\n/* ===== IMPORTED HOME.MD CSS ===== */\\n')
        f.write(styles_css)

print('Migration completed successfully!')
