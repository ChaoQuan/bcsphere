/*
	Copyright 2013-2014, JUMA Technology

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

		http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/
var serviceUniqueID = "";
var interval_notify_index = "";
var app = {
	webview : null,
	
    // Application Constructor
    initialize: function() {
        app.bindCordovaEvents();
        setTimeout(function(){
        	$.mobile.changePage("searched.html","slideup");
        },1500);
    },
    
    bindCordovaEvents: function() {
        document.addEventListener('bcready', app.onBCReady, false);
		document.addEventListener('deviceconnected', app.onDeviceConnected, false);
		document.addEventListener('devicedisconnected', app.onBluetoothDisconnect, false);
		document.addEventListener('newdevice', app.addNewDevice, false);
    },
    
    device_page: function(deviceAddress){
    	app.device = BC.bluetooth.devices[deviceAddress];
		BC.Bluetooth.StopScan();
		var URL = null;
		if(app.device.deviceName == "SimpleBLEPeripheral"){
			URL = "../bcautotest/index.html";
		}else if(app.device.deviceName == "iBeacon"){
			URL = "../bcibeacon/index.html";
		}else if(app.device.deviceName == "bcsocket"){
			URL = "../bcsocket/index.html";
		}
		if(URL !== null){
			app.showLoader("Loading App...");
			setTimeout(function(){
				app.hideLoader();
				var ref = window.open(URL, '_blank', 'location=yes');
			},1000);
		}
    },
    
    showLoader : function(message) {
		$.mobile.loading('show', {
			text: message, 
			textVisible: true, 
			theme: 'a',        
			textonly: true,   
			html: ""           
		});
	},

	hideLoader : function(){
		$.mobile.loading('hide');
	},
    
    startScan : function(){
    	$('#spinner').attr("src","img/searching.png").addClass('img-responsive spinner').next().show();
    	$('#spinner').attr("onclick","app.stopScan()");
    	BC.Bluetooth.StartScan();
    },

    addDevices : function(){
        var deviceList = BC.bluetooth.devices;
        if(deviceList){
            for(var deviceKey in deviceList){
                app.addNewDevice({"deviceAddress":deviceKey});
            }
        }
        app.startScan();
    },
    
    stopScan : function(){
    	$('#spinner').attr("src","img/arrow.png").removeClass('spinner').next().hide();
    	$('#spinner').attr("onclick","app.startScan()");
    	BC.Bluetooth.StopScan();
    },
    
    onBCReady: function() {
		if(!BC.bluetooth.isopen){
			if(API !== "ios"){
				BC.Bluetooth.OpenBluetooth(function(){
				});
			}else{					
				alert("Please open your bluetooth first.");
			}
		}
    },
	
	addNewDevice: function(arg){
		var deviceAddress = arg.deviceAddress;
		var viewObj	= $("#user_view");
		var liTplObj=$("#li_tpl").clone();
		var newDevice = BC.bluetooth.devices[deviceAddress];
		$(liTplObj).attr("onclick","app.device_page('"+newDevice.deviceAddress+"')");
		liTplObj.show();
		
		for(var key in newDevice){
			if(key == "isConnected"){
				if(newDevice.isConnected){
					$("[dbField='"+key+"']",liTplObj).html("YES");
				}
				$("[dbField='"+key+"']",liTplObj).html("NO");
			}else{
				$("[dbField='"+key+"']",liTplObj).html(newDevice[key]);
			}
		}
		viewObj.append(liTplObj);
	},

};
