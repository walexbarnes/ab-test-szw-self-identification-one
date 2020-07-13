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


