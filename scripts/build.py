import os os.makedirs("dist", exist_ok=True)

html = """

준비 완료
"""
with open("dist/index.html", "w", encoding="utf-8") as f: f.write(html)

print("build done")
