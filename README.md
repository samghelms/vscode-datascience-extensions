# VScode Data science extensions

This is a collection of extensions to vscode made by data scientists (like me!) for data scientists.

# Extensions

## (Jupyter notebook extension)[packages/jupyter-notebook/README.md]

Allows running jupyter notebooks in their full glory in vscode.

## (Jupyter filesystem provider extension)[packages/jupyter-fsprovider/README.md]

Allows remotely editing a file system via a jupyter notebook server.

# Ideas

1. Airbnb knowledge repo integration (button to publish md, rmd, ipython)

2. airflow integration (what would this even look like?)

3. Markdown based interactive shell (ie rmarkdown but a polyglot notebook that can run many languages)

4. Markdownx based interactive shell

5. Remote search

6. Remote terminal

7. Integrate the remote file system add on/notebooks with the python extension

5 + 6 are dependent on vscode finalizing some apis

3 + 4 would be a lot easier if (this pull request)[] gets accepted.

8. As a hold-over until the terminal api is finalized, maybe we could create some sort of interactive bash script tool that could run in a web view or via some editor extensions.

9. SQL IDE that uses sqlalchemy + python (+ optionally jupyter for remote execution) to connect to arbitrary databases.

# TODOS

- [] Modularize the packages in this repository so that they share code better.

- [] Create bundles of packages for release.