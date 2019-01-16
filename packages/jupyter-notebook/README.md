# Jupyter notebook extension for vscode

This extension allows you to open and run jupyter notebooks in vscode. It is just like opening a jupyter notebook, just inside of vscode.

TODO: add a gif demonstrating the extension.

# How to use 

After installing the extension, if you open .ipynb files you will see a rocket icon in the upper right-hand corner of the editor. If you click this icon it will close the .ipynb file and open it in a new tab as a jupyter notebook. 

The extension will first prompt you for a jupyter notebook address. For now, the extension requires that you already have a running notebook server and only supports notebooks that have the same root directory. Note that you will need to use token authentication and provide a url with a token (for example: http://localhost:8888/?token=3330d4f2ca1ca7ec547379e5f8cdaab8cf56f0fd16e69db7). 

You will also need to allow all origins -- start the notebook with the setting --NotebookApp.allow_origin=* (`jupyter notebook --NotebookApp.allow_origin=*`). You may need to use http instead of https as your protocol as well.

WARNING: I have not implemented a method for the notebook and other editors to talk, so if you edit the underlying .ipynb file using a vscode editor, you will corrupt your notebook (that's why I close the .ipynb file when you click the button).

# TODOS:

[] Make it easier to launch jupyter notebooks.
[] Allow automatically launching a jupyter notebook instance via the python package.
[] Password/https authentication.
[] Better warning messages.
[] Tests??
[] Make it so that the main process is communicating with jupyter and sending the jupyter results to the webview. This will allow for efficient updates to multiple editor windows.