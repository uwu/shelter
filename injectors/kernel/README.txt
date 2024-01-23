To load shelter from a different place, add a settings key to index.json so it looks like one of these:

{
    "name": "Shelter Loader",
    "id": "kernel-shelter",
    "dependencies": [],
    "description": "Injects https://github.com/uwu/shelter with Kernel",
    "settings": {
    	"sourceType": "remote",
    	"sourcePath": "https://example.com/path/to/shelter.js"
    }
}

or

{
    "name": "Shelter Loader",
    "id": "kernel-shelter",
    "dependencies": [],
    "description": "Injects https://github.com/uwu/shelter with Kernel",
    "settings": {
    	"sourceType": "local",
    	"sourcePath": "/home/user/source/shelter/dist/shelter.js"
    }
}
