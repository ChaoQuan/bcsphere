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


var app = {
    state : "waiting_to_find",
    isOpenPreventLost : true,
    interval_rssi : "",
    interval_connect : "",
    isLoss : false,
    connect_state : false ,
    device : {},
    initialize: function() {
	    app.bindCordovaEvents();
    },
    
    bindCordovaEvents: function() {
        document.addEventListener('bcready', app.onBCReady, false);
		document.addEventListener('deviceconnected', app.onDeviceConnected, false);
		document.addEventListener('devicedisconnected', app.onBluetoothDisconnect, false);
		document.addEventListener('newdevice', app.addNewDevice, false);
		document.addEventListener('bluetoothstatechange', app.onBluetoothStateChange, false);
    },
    
    onBCReady: function() {
		if(!BC.bluetooth.isopen){
			if(API !== "ios"){
				BC.Bluetooth.OpenBluetooth(function(){
				});
			}else{					
				//alert("Please open your bluetooth first.");
			}
		}
    },
    
   	onBluetoothStateChange : function(){
		if(BC.bluetooth.isopen){
			//alert("your bluetooth has been opened successfully.");
			var scanOnOff = $("#scanOnOff");
			scanOnOff[0].selectedIndex = 0;
			scanOnOff.slider("refresh");
		}else{
			//alert("bluetooth is closed!");
			BC.Bluetooth.OpenBluetooth();
		}
	},
	
	onBluetoothDisconnect: function(arg){
		
        window.clearInterval(app.interval_rssi);
		$.mobile.changePage("searched.html","slideup");
	},
    
    onDeviceConnected : function(arg){
		var deviceAddress = arg.deviceAddress;
		
	},
    
    
     startScan : function(){
        
    	$('img#spinner').attr("src","img/searching.png").addClass('img-responsive spinner').next().show();
    	$('img#spinner').attr("onclick","app.stopScan()");
    	BC.Bluetooth.StartScan();
    },
    
    addStartDevice : function(){
        var deviceList = BC.bluetooth.devices;
        if(deviceList){
            for(var deviceKey in deviceList){
                app.addNewDevice({"deviceAddress":deviceKey});
            }
        }
        app.startScan();
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
    
    stopScan : function(){
    	$('img#spinner').attr("src","img/arrow.png").removeClass('spinner').next().hide();
    	$('img#spinner').attr("onclick","app.startScan()");
    	BC.Bluetooth.StopScan();
    },
    
    device_page: function(deviceAddress){
    	if(deviceAddress){
    		app.device = BC.bluetooth.devices[deviceAddress];
    		
			BC.Bluetooth.StopScan();
    	}
    		
    	$.mobile.changePage("findme.html","slideup");
    	
    },
    
    findMe : function(){
    	var img = $('#doevent').attr('src');
		if(app.state == "waiting_to_find"){
			app.state = "finding";
			
			app.interval_connect = window.setInterval(function()
            {
            	var addr = sessionStorage.getItem("deviceAddress");
            	
                app.device.connect(app.connectSuccess);
            }, 5000);


			$('#doevent').attr('src','img/stop.png');
			
			app.canvas();
			return;
		}
		if(app.state == "finding"){
			app.state = "waiting_to_find";
			window.clearInterval(app.interval_connect);
			$('#doevent').attr('src','img/find.png');
		
			$('canvas').remove();
			return;
		}
		if(app.state == "standing_by"){
			app.state = "find_me";

			app.device.getServiceByUUID("1802")[0].discoverCharacteristics(
                    function(){
                        app.device.getServiceByUUID("1802")[0].characteristics[0].write("Hex","02",function(){});},
                    function(){});
			$('#doevent').attr('src','img/refresh2.png');
			return;
		}
		if(app.state == "find_me"){
			app.state = "standing_by";
			navigator.notification.stopBeep();
			app.device.getServiceByUUID("1802")[0].discoverCharacteristics(
                    function(){
                        app.device.getServiceByUUID("1802")[0].characteristics[0].write("Hex","00",function(){});},
                    function(){});
			$('#doevent').attr('src','img/refresh1.png');
			return;			
		}		
    },

    connectSuccess : function()
    {
    	app.state = "standing_by";
    	$('#doevent').attr('src','img/refresh1.png');
		$('canvas').remove();



    	app.device.discoverServices(function(){
    		window.clearInterval(app.interval_connect);
    		app.device.getServiceByUUID("ffe0")[0].discoverCharacteristics(function(){
			app.device.getServiceByUUID("ffe0")[0].characteristics[0].subscribe(app.onNotify);
				},function(){});
	    	if (app.isOpenPreventLost == true) {
	            app.interval_rssi = window.setInterval(function() {
	                app.device.getRSSI(app.getRSSISuccess);
	            }, 1500);
	        };
    	});
    	
    },

    getRSSISuccess : function(data)
    {
    	if(data > -80)
        {
            if (app.isLoss == true) 
            {
                app.isLoss = false;
                navigator.notification.stopBeep();
                app.device.getServiceByUUID("1802")[0].discoverCharacteristics(
                    function(){
                        app.device.getServiceByUUID("1802")[0].characteristics[0].write("Hex","00",function(){});},
                    function(){});
            };        
        }
        else
        {        
            if (app.isLoss == false) 
            {
                app.isLoss = true;
                navigator.notification.beep();
              
                app.device.getServiceByUUID("1802")[0].discoverCharacteristics(
                    function(){
                    
                        app.device.getServiceByUUID("1802")[0].characteristics[0].write("Hex","02",function(){});},
                    function(){});
            };          
        }
    },

    onNotify:function(data){
		var value = data.value.getHexString();
		if( value == "20")
		{
			if (app.state == "standing_by") 
				{
					app.state = "find_me";	
					$('#doevent').attr('src','img/refresh2.png');	
				};				
			navigator.notification.beep();
		}
		else
		{
			if (app.state == "find_me") 
				{
					app.state = "standing_by";
					$('#doevent').attr('src','img/refresh1.png');
				};
				navigator.notification.stopBeep();
		}
    },

    back : function()
    {
    	if (app.device.isConnected) 
    		{
    			app.device.disconnect();
    		};
    	$.mobile.changePage("searched.html","slideup");

    },

    goToSetting : function()
    {
    	$.mobile.changePage("setting.html","slideup");
    },






































	canvas : function (){
				var winHeight = sessionStorage.getItem("winHeight")-60;
				var winWidth = sessionStorage.getItem("winWidth");
				var canvas=$("<canvas id='cartoon' width='"+winWidth+"' height='"+winHeight+"'>");
				
				$('.content').append(canvas);
				
				var centerx = sessionStorage.getItem("centerx");
				var centery = sessionStorage.getItem("centery");
				
				var canvas=$('#cartoon');
				var context=canvas.get(0).getContext("2d");
				var Shape=function(x,y,z){
				  this.x=x;
				  this.y=y;
				  this.z=z;
				}

				var shapes=new Array();
				shapes.push(new Shape('rgb(119,79,35)',0.5,112));
				shapes.push(new Shape('rgb(119,79,35)',0.5,182));
				shapes.push(new Shape('rgb(119,79,35)',0.5,262));
				length1=shapes.length;
				var tmp;
				var i=0;


			    function change(){
					tmp=shapes[i];
					context.strokeStyle=tmp.x;
					context.lineWidth=tmp.y;
					context.beginPath();
					context.arc(centerx,centery,tmp.z,0,Math.PI*2,false);
					context.closePath();
					context.stroke();
					if(i<length1){
						i++;
						setTimeout(change,400);
					}
				}
			    setTimeout(change,400);
			
				function change1(){
					context.clearRect(0,0,winWidth,winHeight);
					for(j=0;j<length1;j++){
						tmp=shapes[j];
						context.strokeStyle=tmp.x;
						context.lineWidth=tmp.y;
						context.beginPath();
						context.arc(centerx,centery,tmp.z,0,Math.PI*2,false);
						context.closePath();
						context.stroke();
					}
				
				    context.strokeStyle="rgb(119,79,35,50)";
					context.lineWidth='1';
					context.beginPath();
					context.arc(centerx,centery,i,0,Math.PI*2,false);
					context.closePath();
					context.stroke();
					if(i<centerx){
						i+=20;
					}else{
						i=0;
					}
		
					setTimeout(change1,40);
				}
			setTimeout(change1, 10);
		},
	
};
