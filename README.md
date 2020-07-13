# szw-self-identification-one

## Background
To enhance the client's understanding of who is using the site, we deployed a self identification tool wherein users select their audience type upon landing. The tool needed to provide a venue for the user to select their audience type, but also send the user's selection into our analytics platform (Adobe Analytics). Using a plugin called [Featherlight](https://github.com/noelboss/featherlight/), and an A/B testing platform called Adobe Target, we devloped and deployed this tool. 

The most important feature of the tool is its impact on site behavior. The client did not want to negatively impact site metrics; for example, we wanted to be sure that whatever we are showing the users does not make them immediately leave the site when they otherwise would have stayed. 

Therefore, I developed the code with flexibility in mind, knowing there would be multiple iterations and tweaks before a final functionality was determined.  
