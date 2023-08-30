pip install -r requirements.txt
pyinstaller --noupx --onefile --additional-hooks-dir=.\pyinstaller-hook --add-data "templates;templates" --add-data "static;static" app_async.py
