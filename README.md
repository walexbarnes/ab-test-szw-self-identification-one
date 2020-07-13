# szw-self-identification-one

## Background
To enhance the client's understanding of who is using the site, we deployed a self identification tool wherein users select their audience type upon landing. The tool needed to provide a venue for the user to select their audience type, but also send the user's selection into our analytics platform (Adobe Analytics). Using a plugin called [Featherlight](https://github.com/noelboss/featherlight/), and an A/B testing platform called Adobe Target, we devloped and deployed this tool. 

The most important feature of the tool is its impact on site behavior. The client did not want to negatively impact site metrics; for example, we wanted to be sure that whatever we are showing the users does not make them immediately leave the site when they otherwise would have stayed. 

Therefore, I developed the code with flexibility in mind, knowing there would be multiple iterations and tweaks before a final functionality was determined.  

## Code Review
Note that the entirity of the code is available [here](https://github.com/walexbarnes/szw-self-identification-one/blob/master/self_id_code.js) without commentary interruptions and demonstrations.

The code is broken up into two functions: load dependencies and set content. 

### Loading Dependencies 
```
function loadDependencies(callback) {
    try {
        //FL CSS 
        loadScript('featherlight-css-adobe-target', '//cdn.jsdelivr.net/npm/featherlight@1.7.14/release/featherlight.min.css', 'css');
        //FL JS
        loadScript('featherlight-js-adobe-target', '//cdn.jsdelivr.net/npm/featherlight@1.7.14/release/featherlight.min.js', 'js');

        function loadScript(elId, ref, type) {
            if (!document.getElementById(elId)) {
                switch (type) {
                    case 'css':
                        var head = document.getElementsByTagName('head')[0];
                        var link = document.createElement('link');
                        link.id = elId;
                        link.rel = 'stylesheet';
                        link.type = 'text/css';
                        link.href = ref;
                        head.appendChild(link);
                        _satellite.logger.warn('appending css script with id of ' + elId);
                        break;

                    case 'js':
                        var body = document.getElementsByTagName('body')[0];
                        var script = document.createElement('script');
                        script.id = elId;
                        script.charset = 'utf-8';
                        script.type = 'text/javascript';
                        script.src = ref;
                        script.onload = () => callback(script);
                        body.appendChild(script);
                        _satellite.logger.warn('appending js script with id of ' + elId);
                        break;
                }

            }
        }
    }

    catch (err) {
        _satellite.logger.warn(err);
        _satellite.logger.warn('loadDependencies()');
    }
}
```
