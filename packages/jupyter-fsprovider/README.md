# Jupyter Filesystem Provider

This extension implements file system using the Jupyter contents API and the VScode filesytem provider api. The filesystem root will be the base directory of the jupyter notebook server.

This allows you to edit files on remote computers via a jupyter notebook server.


To *get started* you need this:

* install this extension
* when *not* having a workspace opened, select 'F1 > [MemFS] Setup Workspace' (optionally save the workspace now)
* select 'F1 > [MemFs] Create Files' and notice how the explorer is now populated
* ... try things out, e.g. IntelliSense in memfs-files, create new files, save them, etc
* select 'F1 > [MemFs] Delete Files' or reload to restart


jupyter notebook --NotebookApp.allow_origin="*"