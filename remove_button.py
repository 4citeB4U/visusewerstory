import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and remove the Evidence button between pause button and settings button
# This is the one in the left control cluster
pattern = r'(\t\t\t\t\t</button>\s*\n\s*\n)(\t\t\t\t\t<button\s+className="rounded border border-white/30[^>]+>\s+Evidence\s+</button>\s*\n\s*\n)(\t\t\t\t\t<button\s+aria-label="Open settings")'

content = re.sub(pattern, r'\1\3', content, flags=re.DOTALL)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Removed duplicate Evidence button")
