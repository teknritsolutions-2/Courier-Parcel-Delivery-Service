"""Copy deployable static source without a build step. GitHub Pages can serve root directly."""
from pathlib import Path
import shutil
root=Path(__file__).resolve().parents[1]
out=root/'out'
if out.exists():shutil.rmtree(out)
out.mkdir()
for name in ['index.html','pages','assets']:
 source=root/name
 if source.is_dir():shutil.copytree(source,out/name)
 else:shutil.copy2(source,out/name)
(out/'.nojekyll').touch()
print('Static deployment files staged in out/. Source remains at repository root.')
