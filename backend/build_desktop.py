import PyInstaller.__main__
import os
import shutil

def build():
    print("Preparing to build Pulse Backend Node...")
    
    # Clean previous builds
    if os.path.exists("build"):
        shutil.rmtree("build")
    if os.path.exists("dist"):
        shutil.rmtree("dist")
        
    PyInstaller.__main__.run([
        'gui.py',
        '--name=PulseNode',
        '--onefile',
        '--windowed', # Run invisibly in background (no console pop up for users)
        '--add-data=services;services',
        # Include hidden imports for fastapi/uvicorn/pydantic/genai
        '--hidden-import=uvicorn.logging',
        '--hidden-import=uvicorn.loops',
        '--hidden-import=uvicorn.loops.auto',
        '--hidden-import=uvicorn.protocols',
        '--hidden-import=uvicorn.protocols.http',
        '--hidden-import=uvicorn.protocols.http.auto',
        '--hidden-import=uvicorn.protocols.websockets',
        '--hidden-import=uvicorn.protocols.websockets.auto',
        '--hidden-import=uvicorn.lifespan',
        '--hidden-import=uvicorn.lifespan.on',
        '--hidden-import=sys',
        # MetaTrader5 implicit dependencies
        '--hidden-import=numpy',
        '--hidden-import=numpy.core',
        '--hidden-import=numpy._core.multiarray',
    ])
    
    print("Build complete. Executable is in the 'dist' folder.")

if __name__ == "__main__":
    build()
