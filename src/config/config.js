if(!window.jQuery){console.log("請確認是否引入jQuery lib!!!!!");}else{
  var DataSetting = function()
  {
    var _allSetting = {};
    this.optSet = function(_set)
    {
      _allSetting = _set;
    };
    this.optGet = function()
    {
      return _allSetting;
    };
  };

  DataSetting.prototype.GoogleAnalytics = function(_code)
  {
    var _googleAnalyticsCode = _code; 
    if(_googleAnalyticsCode.length < 13){ 
      alert("Pleace enter google-analytics tracking code!"); 
      return false;
    }else{
      /* jshint ignore:start */
      (function(i, s, o, g, r, a, m){
        i.GoogleAnalyticsObject = r;
        i[r] = i[r] || function() {
            (i[r].q = i[r].q || []).push(arguments);
        }, i[r].l = 1 * new Date();
        a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m);
      })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
      ga('create', _googleAnalyticsCode , 'auto');
      ga('require', 'displayfeatures');
      ga('require', 'linkid', 'linkid.js');
      ga('send', 'pageview');
      ga('send', 'event', 'GAinit', 'click');
      /* jshint ignore:end */
    }
  };

  DataSetting.prototype.checkMetaTag = function(){
    console.log("%c開始檢查meta標籤設定......","color: #ff0000; font-size: 18px;");
    var metaTag = document.getElementsByTagName('meta');
    var checkFlag = 0;
    for(var i = 0 ; i<metaTag.length; i++){
      var httpEquiv = metaTag[i].getAttribute("http-equiv");
      var tagContent = metaTag[i].getAttribute("content");
      var normalTag = metaTag[i].getAttribute("name");
      var fbTag = metaTag[i].getAttribute("property");
      // console.log(tagContent);
      
      if(normalTag == "chromesniffer"){
        console.log("chromesniffer 為browersync 所產生的標籤 故忽略不檢查");
        checkFlag += 1;
      }else if(httpEquiv){
        checkFlag += 1;
      }else if(!tagContent && normalTag !== null){
        console.log("%cmetaTag-'" + normalTag + "' 目前尚未設定",'color: #FF2441;');
      }else if(!tagContent && fbTag !== null) {
        console.log("%cmetaTag-'" + fbTag + "' 目前尚未設定",'color: #FF2441;');
      }else if(tagContent && normalTag !== null){
        checkFlag += 1;
        console.log("%cmetaTag-'" + normalTag + "' 目前已設定為：" + tagContent,'color: #158AFF;');
      }else if(tagContent && fbTag !== null){
        checkFlag += 1;
        console.log("%cmetaTag-'" + fbTag + "' 目前已設定為：" + tagContent,'color: #158AFF;');
      }
    }
    if(checkFlag != metaTag.length){
      console.log("%c目前尚有：" +(metaTag.length - checkFlag)+ " 組 meta標籤未設定", "color: #8665FF; font-size: 18px;");
      console.log("%c請重新確認所有meta設定，以及tab icon設定", "color: #FFA500; font-size: 18px;");
      return false;
    }else{
      console.log("%c已確認所有meta設定", "color: #FFA500; font-size: 18px;");
      return true;
    }
  };

   var readySet = function (_data){
    var dataOption = new DataSetting();
    var metaCheck = false;
    if(location.href.indexOf(_data.test_DomainName) != -1){
      dataOption.optSet(_data.SettingGroup[0]);
      dataOption.GoogleAnalytics(_data.SettingGroup[0].Google_Analytics_tracking_code);
      if(_data.metaCheckIgnore){
        metaCheck = true;
        console.log("%cmeta標籤檢查已被設定為 ”忽略“！！！","color: #ff0000; font-size: 18px;");
      }else
      if(_data.check_metaTag){
        metaCheck = dataOption.checkMetaTag();
      }
      // console.log(dataOption.optGet());
      if(metaCheck){init();}
    }else{
      dataOption.optSet(_data.SettingGroup[1]);
      dataOption.GoogleAnalytics(_data.SettingGroup[1].Google_Analytics_tracking_code);
      console.log(dataOption.optGet());
      init();
    }
  };

  var onLoadConfig = function () {
    $.getJSON('./config/option.json')
    .done(function(d) {
      readySet(d);
    })
    .fail(function() {
      console.log("%c 載入設定失敗！請檢查路徑或檔案是否正確","color: #ff0000;");
      setTimeout(onLoadConfig,5000);
    });
  };

  $(window).on("load",onLoadConfig);
}
