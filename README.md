# szw-self-identification-one
[Quick video demo](https://github.com/walexbarnes/szw-self-identification-one/blob/master/demo/transparent_button.mp4)

## Background
To enhance the client's understanding of who is using the site, we deployed a self identification tool wherein users select their audience type upon landing. The tool needed to provide a venue for the user to select their audience type, but also send the user's selection into our analytics platform (Adobe Analytics). Using a plugin called [Featherlight](https://github.com/noelboss/featherlight/), and an A/B testing platform called Adobe Target, I developed and deployed this tool. 

The most important feature of the tool is its impact on site behavior. The client did not want to negatively impact site metrics; for example, we wanted to be sure that whatever we are showing the users does not make them immediately leave the site when they otherwise would have stayed. 

Therefore, I developed the code with flexibility in mind, knowing there would be multiple iterations and tweaks before a final functionality was determined.  

## Code Review
Note that the entirity of the code is available [here](https://github.com/walexbarnes/szw-self-identification-one/blob/master/self_id_code.js) without commentary interruptions and demonstrations.

The code is broken up into two functions: load dependencies and set content. 

### Loading Dependencies 

Featherlight requires two scripts to be loaded before you can access the featherlight object: a CSS script and a JavaScript script. If the code that gets these scripts and the code that manipulates the lightbox ran all at the same time, the code that manipulates the lightbox would try to access an object that does not exist and would return an error. Therefore, I have built in a callback into the JS portion of the load script such that any actions that should occur only after the JS has loaded will operate as expected. 

I created a function within this function to load other scripts modularly, as the site where I deploy this may have other CSS files that I might have to inject later. This makes that process easier, should that occur. 

I have built in a `try and catch` to find errors in the function, should there be any. 
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

### Setting Content
The `setContent()` function is what I pass in as an argument to `loadDependencies()` as a callback to ensure that the featherlight object is available for access before it is manipulated. 

#### The options
The client wanted to test multiple different iterations of the test wherein we adjust the number and ordering of the options for user type. The featherlight object only allows one JS variable, passed through as a string, to set the content of the lightbox. Therefore, changing the tools options could become a cumbersome and error prone process if done manually, multiple times over. 

Therefore, i created a `makeNewoption()` function to assist me with dynamically adding and changing the order of the options on the fly. It accepts two arguments, the `value` and the `text`. The value is used to capture the user's input and send it to our reporting platform (more on that later) and the text is the actual text that the end user sees and can select. 

Regardless of the number/ordering of options two parts remain the same: the "intro" and the button at the end to close the survey and enter the site. 

To make this work, I stored both the button and the intro as separate JS string variables. I initialized an empty array to hold the options created with my `makeNewOption()` function. Within that function, each new option is appended to the array. 

After all options are created, a for loop traverses the length of the array and concatonates the option values into one JS variable. 

Finally, the intro variable is combined with the concatonated options variable and the button variable to create the contents of the survey.  

```
        var introBones = '<h4 class="intro-copy">Please help us make the site better by identifying yourself:</h4>';
        var closeBones = '<div class="component-general-content-block__cta featherlight-inner" style="text-align: center;"><a class="cta cta--brandneutral" target="_self">Enter Site</a></div>';
        var optionsRecord = [];
        var concatOptions = '';

        makeNewOption("Owner","I currently own a Sub-Zero and/or Wolf and/or Cove product");
        makeNewOption("OwnerInMarket","I currently own a Sub-Zero and/or Wolf and/or Cove product and am shopping for another appliance");
        makeNewOption("Shopper","I do not currently own a Sub-Zero and/or Wolf and/or Cove and am shopping for appliances");
        makeNewOption('Trade',"I am a trade professional (e.g. architect, designer, dealer, installer, sales professional)");
        makeNewOption('ChannelPartner',"I am a channel partner (e.g. dealer, distributor, showroom, servicer, installer)");
        makeNewOption('Employee',"I am looking for employment or I am an employee");


        for(var i=0; i < optionsRecord.length; i++)
        {
            concatOptions=concatOptions+optionsRecord[i];
        }

        var content = introBones+concatOptions+closeBones;

        $.featherlight(content,{closeOnClick:'background',afterClose:function(event){sessionStorage.setItem('selfIDclosed',sessionStorage.getItem('selfIDopen'))}});
```

See it in action [BaseButton](https://github.com/walexbarnes/szw-self-identification-one/blob/master/demo/base_button.mp4) [HideThenShowButton](https://github.com/walexbarnes/szw-self-identification-one/blob/master/demo/hide_show_button.mp4) [TransparentButton](https://github.com/walexbarnes/szw-self-identification-one/blob/master/demo/transparent_button.mp4)

#### The button functionality
Again, for the client, flexibility is key: test multiple versions of the tool to determine the variant with the lowest negative impact on behavior. 

Therefore, multiple functionalities for the "Enter the Site" button would need to be tested and combined with other iterations and tool combinations. 

To make the button functionality flexible, I created a function to change the button functionality by merely altering the argument of that function. 

There are three functionalities to test: a base button that is there, but does not close the survey until the user makes a selection, a button that is transparent and not clicable until the user makes a selection, and a button that is hidden and only shows up when a user makes a selection. 

The base functionality is determined within the `buttonFunctionality()` function as its own function. Regardless of the argument passed into the `buttonFunctionality()`, the `baseFunctionality()` will always run. This base functionality sets a browser storage object on click (for data collection - more on that later), and gives the button the power to close the survey if an option is selected. 

A switch statement will run and will evaluate the expression passed into the `buttonFunctionality(arg)` function. The argument passed determines which functionality displays. All three button functionalities utilize the `baseFunctionality()` but have added code where necessary to tweak it for that functionality. 
```
        //Pass in arguments "showTransparent", or "hideThenShow", or "nothing" 
        buttonFunctionality('showTransparent');


        function buttonFunctionality(doWhat)
        {
            var optionSelector = $('section.featherlight-inner');
            var button = $('.component-general-content-block__cta.featherlight-inner'); 

            switch(doWhat)
            {
                case("hideThenShow"):
                    button.hide();
                    optionSelector.find('label').on('click',function(){
                        button.show();
                        baseFunctionality($(this));
                    });
                    break;
                case("showTransparent"):
                    button.find('a').attr('style',"pointer-events:none!important;cursor:default!important;opacity:.5!important");
                    optionSelector.find('label').on('click',function(){
                        button.find('a').removeAttr('style');
                        baseFunctionality($(this));
                    });
                    break;
                case("nothing"):
                    optionSelector.find('label').on('click',function(){
                    baseFunctionality($(this));
                       
                    });
                    break;
            }
            function baseFunctionality(arg){
                sessionStorage.setItem('selfIDopen',arg.find('input').attr('value'));
    
                if(!button.find('a').hasClass("featherlight-close"))
                {
                    button.find('a').addClass("featherlight-close");
                }
            }
        }


```
#### The data collection
The user's input must be collected and sent to our analytics platform. I accomplish this by setting a browser storage object, set to `noSelection`, before the survey loads up. 
Once the survey loads, and the user selects an option, the button's `baseFunctionality()` will change the value of the browser storage object to the value passed into the first argument of the `makeNewOption()` function for the selection's option. 

Once the user closes the survey tool, by the X button or the Enter the Site button, a new sessionStorage item will pick up the last value of the old sessionStorage item. 

In the tag manager, I configured it to where when the new sessionStorage item is set, a tag will fire and send the user's selection to our data collection server so we can report on it. 

I used a new sessionStorage item so that it does not fire the tag until the user has closed the survey, not while they click back and forth between options. 

```
sessionStorage.setItem('selfIDopen','noSelection');

$.featherlight(content,{closeOnClick:'background',afterClose:function(event){sessionStorage.setItem('selfIDclosed',sessionStorage.getItem('selfIDopen'))}});

   function baseFunctionality(arg){
                sessionStorage.setItem('selfIDopen',arg.find('input').attr('value'));
    
                if(!button.find('a').hasClass("featherlight-close"))
                {
                    button.find('a').addClass("featherlight-close");
                }
            }
```

#### Device agnostic 
To make the survey look presentable on desktop and mobile, I attached a listener function that changes the width of the survey based on screen size.
```
  var x = window.matchMedia("(min-width: 750px)");
        changeBoxWidth(x); // Call listener function at run time
        x.addListener(changeBoxWidth); // Attach listener function on state changes
        
      function changeBoxWidth(x) {
            if (x.matches) {
                applyAllStyling('775');
            }
            else {
                applyAllStyling('300');
            }

            function applyAllStyling(width) {
                $('.featherlight-content').attr('style', 'width:' + width + 'px;display:inline-block');
                $('.featherlight-content .create-account-content').attr('style', 'padding:8px;text-align:left!important');
                $('.featherlight-close').attr('style', 'text-align:center');
                $('.intro-copy').attr('style', 'text-align:center;padding-bottom:10px;padding-top:10px');
                $('.featherlight-content .custom-check-radio__check').hide();
                $('.featherlight:last-of-type').attr('style','display:block;background:rgba(0,0,0,.8)!important');

            }
        }

```

### Full Code 
The full code is available below:
```
loadDependencies(setContent)


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

function setContent() {
    try {
        //var unusedBoxAtTop = '<div class="modal-header grey-box"><h5 class="modal-title forgot-password-text" id="myModalLabel">SELF ID</h5></div>';
        var introBones = '<h4 class="intro-copy">Please help us make the site better by identifying yourself:</h4>';
        var closeBones = '<div class="component-general-content-block__cta featherlight-inner" style="text-align: center;"><a class="cta cta--brandneutral" target="_self">Enter Site</a></div>';
        var optionsRecord = [];
        var concatOptions = '';

        makeNewOption("Owner","I currently own a Sub-Zero and/or Wolf and/or Cove product");
        makeNewOption("OwnerInMarket","I currently own a Sub-Zero and/or Wolf and/or Cove product and am shopping for another appliance");
        makeNewOption("Shopper","I do not currently own a Sub-Zero and/or Wolf and/or Cove and am shopping for appliances");
        makeNewOption('Trade',"I am a trade professional (e.g. architect, designer, dealer, installer, sales professional)");
        makeNewOption('ChannelPartner',"I am a channel partner (e.g. dealer, distributor, showroom, servicer, installer)");
        makeNewOption('Employee',"I am looking for employment or I am an employee");


        for(var i=0; i < optionsRecord.length; i++)
        {
            concatOptions=concatOptions+optionsRecord[i];
        }

        var content = introBones+concatOptions+closeBones;

        $.featherlight(content,{closeOnClick:'background',afterClose:function(event){sessionStorage.setItem('selfIDclosed',sessionStorage.getItem('selfIDopen'))}});
        //$.featherlight(content,{closeOnClick:false,closeOnEsc:false,afterClose:function(event){sessionStorage.setItem('selfIDclosed',sessionStorage.getItem('selfIDopen'))}});
        //$.featherlight(content,{closeOnClick:false,closeOnEsc:false,closeIcon:'',afterClose:function(event){sessionStorage.setItem('selfIDclosed',sessionStorage.getItem('selfIDopen'))}});
        
        sessionStorage.setItem('selfIDopen','noSelection');

        //Pass in arguments "showTransparent", or "hideThenShow", or "nothing" 
        buttonFunctionality('showTransparent');

        var x = window.matchMedia("(min-width: 750px)");
        changeBoxWidth(x); // Call listener function at run time
        x.addListener(changeBoxWidth); // Attach listener function on state changes

        function makeNewOption(value,copy)
        {
            var newOption = '<section class="create-account-content role-selection no-bottom-padding"><div class="radio radio--inline"><label class="radio-label"><input class="custom-check-radio" id="Role" name="Role" type="radio" value='+value+'><div class="custom-check-radio__check"></div><span>'+copy+'</span></label></div></section>';

            optionsRecord.push(newOption);
        }

        function changeBoxWidth(x) {
            if (x.matches) {
                applyAllStyling('775');
            }
            else {
                applyAllStyling('300');
            }

            function applyAllStyling(width) {
                $('.featherlight-content').attr('style', 'width:' + width + 'px;display:inline-block');
                $('.featherlight-content .create-account-content').attr('style', 'padding:8px;text-align:left!important');
                $('.featherlight-close').attr('style', 'text-align:center');
                $('.intro-copy').attr('style', 'text-align:center;padding-bottom:10px;padding-top:10px');
                $('.featherlight-content .custom-check-radio__check').hide();
                $('.featherlight:last-of-type').attr('style','display:block;background:rgba(0,0,0,.8)!important');

            }
        }


        function buttonFunctionality(doWhat)
        {
            var optionSelector = $('section.featherlight-inner');
            var button = $('.component-general-content-block__cta.featherlight-inner'); 

            switch(doWhat)
            {
                case("hideThenShow"):
                    button.hide();
                    optionSelector.find('label').on('click',function(){
                        button.show();
                        baseFunctionality($(this));
                    });
                    break;
                case("showTransparent"):
                    button.find('a').attr('style',"pointer-events:none!important;cursor:default!important;opacity:.5!important");
                    optionSelector.find('label').on('click',function(){
                        button.find('a').removeAttr('style');
                        baseFunctionality($(this));
                    });
                    break;
                case("nothing"):
                    optionSelector.find('label').on('click',function(){
                    baseFunctionality($(this));
                       
                    });
                    break;
            }
            function baseFunctionality(arg){
                sessionStorage.setItem('selfIDopen',arg.find('input').attr('value'));
    
                if(!button.find('a').hasClass("featherlight-close"))
                {
                    button.find('a').addClass("featherlight-close");
                }
            }
        }
    }

    catch(err)
    {
        _satellite.logger.warn(err);
        _satellite.logger.warn("setContent()");
    }

}



```
