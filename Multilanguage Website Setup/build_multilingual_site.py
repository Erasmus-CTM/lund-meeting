import os
import subprocess
import webbrowser
import http.server
import socketserver
import time
from bs4 import BeautifulSoup

# Get current directory
base_dir = os.path.dirname(os.path.abspath(__file__))
site_dir = os.path.join(base_dir, "_site")

print("\n" + "="*50)
print("MULTILINGUAL WEBSITE BUILDER")
print("="*50)

# =============================================================
# STEP 1: RENDER QUARTO
# =============================================================

print("\n[STEP 1] Rendering all languages...")

profiles = ["english", "deutsch", "swedish", "danish", "norwegian"]

for profile in profiles:
    print(f"  > {profile}...", end=" ")
    result = subprocess.run(
        ["quarto", "render", "--profile", profile],
        cwd=base_dir,
        capture_output=True
    )
    if result.returncode == 0:
        print("OK")
    else:
        print("ERROR!")
        exit(1)

# =============================================================
# STEP 2: ADD LANGUAGE DROPDOWN
# =============================================================

print("\n[STEP 2] Adding language dropdown...")

new_html = r'''<ul class="navbar-nav navbar-nav-scroll ms-auto">
  <li class="nav-item dropdown">
    <a class="nav-link dropdown-toggle" href="#" id="languageDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
      <i class="bi bi-globe"></i>
    </a>
    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="languageDropdown">
      <li><a class="dropdown-item" href="javascript:void(0)" onclick="window.location.href = window.location.href.replace(/\/(en|de|sv|da|no)\//, '/de/')">Deutsch</a></li>
      <li><a class="dropdown-item" href="javascript:void(0)" onclick="window.location.href = window.location.href.replace(/\/(en|de|sv|da|no)\//, '/en/')">English</a></li>
      <li><a class="dropdown-item" href="javascript:void(0)" onclick="window.location.href = window.location.href.replace(/\/(en|de|sv|da|no)\//, '/sv/')">Svenska</a></li>
      <li><a class="dropdown-item" href="javascript:void(0)" onclick="window.location.href = window.location.href.replace(/\/(en|de|sv|da|no)\//, '/da/')">Dansk</a></li>
      <li><a class="dropdown-item" href="javascript:void(0)" onclick="window.location.href = window.location.href.replace(/\/(en|de|sv|da|no)\//, '/no/')">Norsk</a></li>
    </ul>
  </li>
</ul>'''

count = 0
for root, dirs, files in os.walk(site_dir):
    for filename in files:
        if filename.endswith(".html"):
            filepath = os.path.join(root, filename)
            
            with open(filepath, 'r', encoding='utf-8') as f:
                soup = BeautifulSoup(f, 'html.parser')
            
            navbar = soup.find('ul', class_='navbar-nav navbar-nav-scroll ms-auto')
            
            if navbar and not navbar.find('a', id='languageDropdown'):
                new_navbar = BeautifulSoup(new_html, 'html.parser').find('ul')
                navbar.replace_with(new_navbar)
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(str(soup.prettify()))
                
                count += 1
                rel_path = os.path.relpath(filepath, site_dir)
                print(f"  > {rel_path}")

print(f"  {count} files updated")

# =============================================================
# STEP 3: START PREVIEW SERVER
# =============================================================

print("\n[STEP 3] Starting preview server...")

os.chdir(site_dir)
PORT = 8000

socketserver.TCPServer.allow_reuse_address = True
Handler = http.server.SimpleHTTPRequestHandler

print(f"  > Opening browser...")
print(f"  > http://localhost:{PORT}/en/")
print(f"  > Press CTRL+C to stop\n")

# Open browser
time.sleep(1)
webbrowser.open(f"http://localhost:{PORT}/en/")

# Start server
try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\n\nServer stopped.")
