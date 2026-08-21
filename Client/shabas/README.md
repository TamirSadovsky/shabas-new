# Create An EXE file from this files.

- First. make sure that the axios.config.js url is set to localhost. (commant the external url and uncomment the local url)
- Go to the client, use npm run build.
- Then, the dist (build output) folder copy to the server folder.
- in the server folder make sure the part that runs the chrome instance is no commented, and also the route that called * is uncommented.
- then run the command `pkg .`.
- then you will have 3 versing for windows, mac and linux.

# Good luck.