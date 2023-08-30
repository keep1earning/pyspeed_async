# hook-app_async.py

from PyInstaller.utils.hooks import collect_data_files

# 添加 "templates" 子目录中的所有文件
datas = collect_data_files('app_async.templates')
