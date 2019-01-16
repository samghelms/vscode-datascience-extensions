# Jupyter Filesystem Provider

This extension implements file system using the Jupyter contents API and the VScode filesytem provider api. The filesystem root will be the base directory of the jupyter notebook server.

This allows you to edit files on remote computers via a jupyter notebook server.

# Usage

Open the command pallette (cmd+shift+p or f1) and run "Setup Jupyter Workspace".

Then open the command pallette again and run "Connect to a Jupyter Server". You will be prompted for a jupyter server. This server needs to have the following config setting: `NotebookApp.allow_origin` (you could open the notebook using `jupyter notebook --NotebookApp.allow_origin="*"`. If it is remote you might need to add `--ip="0.0.0.0").

# TODOS

- [] Make the launch process smoother (one step).
- [] tests??