/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var serviceUUID = "ffe0";
var characteristicUUID = "ffe1";
var serviceUniqueID = "";
var services= [];
var ifCreateService = false;
var socketServiceState = false;
var socketClientState = false;
var repeatScan = false;
var serverOrClient = "";
var characterClient = "";
var characterServer = "";
var viewObj = "";
var interval_scan = "";
var socketList = [{'name':"TI",'serviceuuid':"fff0",'characteristicuuid':"fff1"},{'name':"BC",'serviceuuid':"ffe0",'characteristicuuid':"ffe1"},{'name':"QUINTIC",'serviceuuid':"ffb0",'characteristicuuid':"ffb1"}];
var app = {
        // Application Constructor
    initialize: function() {
        app.bindCordovaEvents();
        app.socketData = [];
        app.outputSocketData = [];
        app.dataClient = "";
    },
        
    bindCordovaEvents: function() {
        document.addEventListener('bcready', app.onBCReady, false);
        document.addEventListener('deviceconnected', app.onDeviceConnected, false);
        document.addEventListener('devicedisconnected', app.onBluetoothDisconnect, false);
        document.addEventListener('newdevice', app.addNewDevice, false);
        document.addEventListener('bluetoothstatechange', app.onBluetoothStateChange, false);
        document.addEventListener('onsubscribestatechange', app.onSubscribeStateChange, false);
        document.addEventListener('oncharacteristicread', app.onCharacteristicRead, false);
        document.addEventListener('oncharacteristicwrite', app.onCharacteristicWrite, false);
    },
        
    onDeviceConnected : function(arg){
        var deviceAddress = arg.deviceAddress;
    },
    
    device_page: function(deviceAddress){
        app.device = BC.bluetooth.devices[deviceAddress];
        $.mobile.changePage("deviceApps.html","slideup");
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
        
    scanRepeat:function(){
        repeatScan = true;
        interval_scan = window.setInterval(function() {
                                       viewObj.empty();
                                       app.addScanData();
                                       }, 50000);
    },
    
    onBluetoothStateChange : function(){
        if(BC.bluetooth.isopen){
            alert("bluetooth open!");
        }else{
            BC.Bluetooth.OpenBluetooth(function(){alert("opened!");});
        }
    },
    
    addStartDevice : function(){
        if(repeatScan){
            window.clearInterval(interval_scan);
            repeatScan = false;
        }
        app.addScanData();
        app.scanRepeat();
    },
    
    addScanData:function(){
        BC.Bluetooth.StopScan();
        BC.Bluetooth.StartScan();
        BC.Bluetooth.GetConnectedDevices(function(dddd){
                                         _.each(dddd,function(org){
                                                    if(org){
                                                        var adevice = new BC.Device(org.deviceName,org.deviceAddress,org.advertisementData,org.isConnected,org.RSSI);
                                                        BC.bluetooth.devices[adevice.deviceAddress] = adevice;
                                                        app.addNewDevice(adevice);
                                                    }
                                                })
                                         },[]);
    },
    
    addNewDevice: function(arg){
        var deviceAddress = arg.deviceAddress;
        viewObj	= $("#user_view");
        var liTplObj=$("#li_tpl").clone();
        var newDevice = BC.bluetooth.devices[deviceAddress];
        $(liTplObj).attr("onclick","app.device_page('"+newDevice.deviceAddress+"')");
        liTplObj.show();
        for(var key in newDevice){
            if(key == "isConnected"){
                if(newDevice.isConnected){
                    $("[dbField='"+key+"']",liTplObj).html("YES");
                }else{
                    $("[dbField='"+key+"']",liTplObj).html("NO");
                }
            }else{
                if(key == "deviceName"){
                    if(newDevice.deviceName.length < 2){
                        $("[dbField='"+key+"']",liTplObj).html("device");
                    }else{
                        $("[dbField='"+key+"']",liTplObj).html(newDevice[key]);
                    }
                }else{
                    $("[dbField='"+key+"']",liTplObj).html(newDevice[key]);
                }
            }
            
        }
        viewObj.append(liTplObj);
    },
    
    onBluetoothDisconnect: function(arg){
//        alert("device:"+arg.deviceAddress+" is disconnected!");
        if(!socketServiceState){
            $.mobile.changePage("searched.html","slideup");
            app.socketData = [];
            app.outputSocketData = [];
            app.dataClient = "";
            characterClient = "";
        }
    },
        
    onScanStartSuccess: function(list){
        //alert(list);
    },
        
    onScanStopSuccess: function(result){
//        alert(result.mes);
    },
        
    onGeneralSuccess: function(result){
//        alert(result.mes);
    },
        
    onGeneralError: function(message){
//        alert(message.mes);
    },
        
    createSocket:function(){
        $.mobile.changePage("createSocket.html","slideup");
    },
    
    configViewInit:function(){
        var viewObj	= $("#socket_view");
        viewObj.empty();
        for(var i=0; i<socketList.length; i++){
            var socketConfig = socketList[i];
            var liTplObj=$("#socket_model").clone();
            var serviceuuid = socketConfig['serviceuuid'];
            var characteristicuuid = socketConfig['characteristicuuid'];
            $("ul",liTplObj).attr("onclick","app.changeConfig('"+serviceuuid+"','"+characteristicuuid+"')");
            liTplObj.show();
            
            for(var key in socketConfig){
                $("[dbField='"+key+"']",liTplObj).html(socketConfig[key]);
            }
            
            viewObj.append(liTplObj);
        }
        
        $("#configOK").click(function(){
                                 if($('#configService').val().length>0 && $('#configCharacteristic').val().length>0){
                                    serviceUUID = $('#configService').val().toLowerCase();
                                    characteristicUUID = $('#configCharacteristic').val().toLowerCase();
                                    window.history.go(-1);
                                 }else{
                                    alert("config data can not be empty");
                                 }
                             });
        
    },
    
    changeConfig:function(serviceuuid,characteristicuuid){
        $("#configService").val(serviceuuid);
        $("#configCharacteristic").val(characteristicuuid);
    },
        
    deviceViewInit: function(){
        var isconnect = app.device.isConnected;
        if(isconnect){
            app.fillServices();
        }
        $("#serviceUUID").html(serviceUUID);
        $("#characteristicUUID").html(characteristicUUID);
        $("#connect").click(app.connectDevice);
        $("#config").click(function(){
                           $.mobile.changePage("config.html","slideup");
                           })
        $("#subscribe").click(function(){
                              characterClient.subscribe(function(data){
                                                            if(data.value.getHexString() == "fedabc"){
                                                                characterClient.unsubscribe(function(){
                                                                                            socketClientState = false;
                                                                                            app.socketData = [];
                                                                                            app.outputSocketData = [];
                                                                                            });
                                                                $.mobile.changePage("deviceApps.html","slideup");
                                                            }else{
                                                                app.dataClient = app.showReceiveData(data.value);
                                                                app.refreshSocketDataList(false,app.dataClient);
                                                            }
                                                        });
                              app.gotobcsocketView();
                              socketClientState = true;
                              });
        
    },
        
    subscribeInit:function(){
        $("#subscribe").click(function(){
                              characterClient.subscribe(function(data){
                                                        if(data.value.getHexString() == "fedabc"){
                                                        characterClient.unsubscribe(function(){
                                                                                    socketClientState = false;
                                                                                    app.socketData = [];
                                                                                    app.outputSocketData = [];
                                                                                    });
                                                        $.mobile.changePage("deviceApps.html","slideup");
                                                        }else{
                                                        app.dataClient = app.showReceiveData(data.value);
                                                        app.refreshSocketDataList(false,app.dataClient);
                                                        }
                                                        });
                              app.gotobcsocketView();
                              socketClientState = true;
                              
                              });
        
    },
        
    connectDevice: function(){
        app.device.connect(app.connectSuccess);
        app.showLoader("Connecting and discovering socket...");
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
    
    connectSuccess: function(message){
        app.device.discoverServices(function(){
                                    app.hideLoader();
                                    app.fillServices();
                                    app.discoverSocket();
                                    },function(message){alert(message);});
    },
    
    fillServices: function(){
        var viewObj	= $("#service_view");
        viewObj.empty();
        for(var i=0; i<app.device.services.length; i++){
            var service = app.device.services[i];
            var liTplObj=$("#service_tpl").clone();
            var serviceIndex = service.index;
            if(service.uuid.indexOf(serviceUUID) == 4){
                liTplObj.children('ul').children('li').css({"color":"rgb(227,125,30)"});
            }
            liTplObj.show();
            
            for(var key in service){
                $("[dbField='"+key+"']",liTplObj).html(service[key]);
            }
            
            viewObj.append(liTplObj);
        }
    },
    
    discoverSocket:function(){
        var socket = app.device.getServiceByUUID(serviceUUID);
        if(socket.length>0){
            var service = socket[0];
            socket[0].discoverCharacteristics(function(){
                                              app.pushdeviceAddress(socket[0]);
                                              },function(){alert("error");});
        }else{
//            alert("server not be finded");
        }
    },
    
    pushdeviceAddress: function(service){
        var character = service.getCharacteristicByUUID(characteristicUUID)[0];
        app.operateCharViewInit(character);
    },
        
    operateCharViewInit: function(character){
        characterClient = character;
        app.subscribeInit();
    },
        
    readCharSuccess: function(data){
//        alert("Read Content(HEX):"+data.value.getHexString()+"\nRead Content(ACSII):"+data.value.getASCIIString()+"\nRead Content(Unicode):"+data.value.getUnicodeString()+"\nRead Time:"+data.date);
    },
        
    writeCharSuccess: function(message){
//        alert("write success! message is:"+JSON.stringify(message));
    },
    
    gotobcsocketView:function(){
        serverOrClient = "client";
        $.mobile.changePage("bcsocketView.html","slideup");
    },
        
    socketViewInit:function(){
        if(ifCreateService){
            $("#createService").hide();
            $("#removeService").show();
        }else{
            $("#createService").show();
            $("#removeService").hide();
        }
    },
    
    createService : function(){
        var service = BC.Bluetooth.CreateService("ffe0");
        var property1 = ["write","notify","read"];
        var permission = ["read","write"];
        var onMyWriteRequestName = "myWriteRequest";
        var onMyReadRequestName = "myReadRequest";
        var character1 = BC.Bluetooth.CreateCharacteristic("ffe1","6778","Hex",property1,permission);
        var descriptor1 = BC.Bluetooth.CreateDescriptor("00002901-0000-1000-8000-00805f9b34fb","00","Hex",permission);
        character1.addDescriptor(descriptor1);
        service.addCharacteristic(character1);
        BC.Bluetooth.AddService(service,app.addServiceSusscess,app.addServiceError);
        services[0] = service;
        serviceUniqueID = service.uniqueID;
    },
    
    addServiceSusscess : function(){
        $("#createService").hide();
        $("#removeService").show();
        ifCreateService = true;
    },
    
    addServiceError : function(){
//        alert("add service error!");
    },

    removeService : function(){
        BC.Bluetooth.RemoveService(BC.bluetooth.services[serviceUniqueID],app.removeServiceSuccess,app.removeServiceError);
    },
    
    removeServiceSuccess : function(){
//        alert("remove service success!");
        $("#createService").show();
        $("#removeService").hide();
        ifCreateService = false;
        socketServiceState = false;
        characterServer = "";
    },
    
    removeServiceError : function(){
//        alert("remove service error!");
    },
    
    onSubscribeStateChange : function(arg){
        var service = BC.bluetooth.services[arg.uniqueID];
        characterServer = service.characteristics[arg.characteristicIndex];
        if(characterServer.isSubscribed){
            socketServiceState = true;
            app.socketStart();
        }else{
            socketServiceState = false;
            app.createSocket();
            app.socketData = [];
            app.outputSocketData = [];
        }
    },
    
    socketStart:function(){
        serverOrClient = "server";
        $.mobile.changePage("bcsocketView.html","slideup");
    },
        
    bcsocketViewInit:function(){
        if(serverOrClient == "server"){
            $("#writeOK").click(function(){
                                    var type = $('.selectType').html();
                                    var value = $('#writeValue').val();
                                    if(value == ""){
                                        return;
                                    }
                                    if(type.toLowerCase() == "hex"){
                                        if (value.length % 2) value = "0" + value;
                                                value = value.toLowerCase();
                                                var data = new Uint8Array(value.length/2);
                                                var pos = "0123456789abcdef";
                                                var isHex = true;
                                                for(var i = 0,j = 0; i < value.length; i += 2,j++){
                                                    if(pos.indexOf(value.charAt(i)) < 0){
                                                        isHex = false;
                                                    }
                                                }
                                                if(isHex){
                                                characterServer.notify(type,$('#writeValue').val(),[],[]);
                                                var vad = app.showSendData(type,$('#writeValue').val());
                                                app.refreshSocketDataList(true,vad);
                                                }
                                            }else{
                                        characterServer.notify(type,$('#writeValue').val(),[],[]);
                                        var vad = app.showSendData(type,$('#writeValue').val());
                                        app.refreshSocketDataList(true,vad);
                                    }
                                app.refreshList();

                                });
        }else if(serverOrClient == "client"){
            $("#writeOK").click(function(){
                                    var type = $('.selectType').html();
                                    var value = $('#writeValue').val();
                                    if(value == ""){
                                        return;
                                    }
                                    if(type.toLowerCase() == "hex"){
                                        if (value.length % 2) value = "0" + value;
                                
                                            value = value.toLowerCase();
                                            var data = new Uint8Array(value.length/2);
                                            var pos = "0123456789abcdef";
                                            var isHex = true;
                                            for(var i = 0,j = 0; i < value.length; i += 2,j++){
                                                if(pos.indexOf(value.charAt(i)) < 0){
                                                    isHex = false;
                                                }
                                            }
                                            if(isHex){
                                                characterClient.write(type,$('#writeValue').val(),app.writeCharSuccess,app.onGeneralError);
                                                var vad = app.showSendData(type,$('#writeValue').val());
                                                app.refreshSocketDataList(true,vad);
                                            }
                                        }else{
                                        characterClient.write(type,$('#writeValue').val(),app.writeCharSuccess,app.onGeneralError);
                                        var vad = app.showSendData(type,$('#writeValue').val());
                                        app.refreshSocketDataList(true,vad);
                                    }
                                app.refreshList();

                                });
        }else{
            alert("error");
        }
    },
    
    socketStop:function(){
        if(socketServiceState){
            characterServer.notify("Hex","FEDABC",[],[]);
            socketServiceState = false;
            app.createSocket();
        }else if(socketClientState){
            characterClient.unsubscribe(function(){
                                        socketClientState = false;
                                        });
            $.mobile.changePage("deviceApps.html","slideup");
        }
        app.socketData = [];
        app.outputSocketData = [];
    },
    
    refreshSocketDataList:function(inOrOut,data){
        var viewObj = $("#socketList_view");
        var liTplObj=$("#socketList_tpl").clone();
        var type = $('.selectType').html();
        if(type.toLowerCase() == "hex"){
            $("[dbField='avalue']",liTplObj).html(data.avalue.getHexString());
        }else if(type.toLowerCase() == "ascii"){
            $("[dbField='avalue']",liTplObj).html(data.avalue.getASCIIString());
        }else if(type.toLowerCase() == "unicode"){
            $("[dbField='avalue']",liTplObj).html(data.avalue.getUnicodeString());
        }
        $("[dbField='adate']",liTplObj).html(data.adate);
        if(inOrOut){
            liTplObj.css({"color":"rgb(227,125,30)"});
            app.outputSocketData.push(data);
        }
        viewObj.append(liTplObj);
        liTplObj.show();
        app.socketData.push(data);
    },
    
    refreshList:function(){
        var viewObj = $("#socketList_view");
        viewObj.empty();
        for(var i=0; i<app.socketData.length; i++){
            var data = app.socketData[i];
            var liTplObj=$("#socketList_tpl").clone();
            var type = $('.selectType').html();
            if(type.toLowerCase() == "hex"){
                $("[dbField='avalue']",liTplObj).html(data.avalue.getHexString());
            }else if(type.toLowerCase() == "ascii"){
                $("[dbField='avalue']",liTplObj).html(data.avalue.getASCIIString());
            }else if(type.toLowerCase() == "unicode"){
                $("[dbField='avalue']",liTplObj).html(data.avalue.getUnicodeString());
            }
            $("[dbField='adate']",liTplObj).html(data.adate);
            for(var z=0; z<app.outputSocketData.length; z++){
                var outputData = app.outputSocketData[z];
                if(data == outputData){
                    liTplObj.css({"color":"rgb(227,125,30)"});
                }
            }
            viewObj.append(liTplObj);
            liTplObj.show();
        }
    },
        
    showSendData:function(type,value){
        if(type.toLowerCase() == "hex"){
            showValue = app.hexToBase64(value);
        }else if(type.toLowerCase() == "ascii"){
            showValue = app.asciiToBase64(value);
        }else if(type.toLowerCase() == "unicode"){
            showValue = app.unicodeToBase64(value);
        }
        var valueSend = new BC.DataValue(app.base64ToBuffer(showValue));
        var dString = app.dateFormat("HH:mm:ss:SSS");
        var valueAndDate = {};
        valueAndDate.adate = dString;
        valueAndDate.avalue = valueSend;
        return valueAndDate;
    },
    
    showReceiveData:function(value){
        var dString = app.dateFormat("HH:mm:ss:SSS");
        var valueAndDate = {};
        valueAndDate.adate = dString;
        valueAndDate.avalue = value;
        return valueAndDate;
    },
    
    dateFormat:function(formatStr){
        var d = new Date();
        var str = formatStr;
        str=str.replace(/hh|HH/,d.getHours()>9?d.getHours().toString():'0' + d.getHours());
        str=str.replace(/mm/,d.getMinutes()>9?d.getMinutes().toString():'0' + d.getMinutes());
        str=str.replace(/ss/,d.getSeconds()>9?d.getSeconds().toString():'0' + d.getSeconds());
        str=str.replace(/SSS/,d.getMilliseconds()>99?d.getMilliseconds().toString():(d.getMilliseconds()>9?'0' + d.getMilliseconds():'00'+d.getMilliseconds()));
        return str;
    },
    
    onCharacteristicRead : function(arg){
        var valuebyRead = "read request";
        var vad = app.showReceiveData(valuebyRead);
        app.refreshSocketDataList(false,vad);
    },
    
    onCharacteristicWrite : function(arg){
        var valueByWrite = arg.arg;
        var vad = app.showReceiveData(valueByWrite);
        app.refreshSocketDataList(false,vad);
    },
        
    convertToBase64:function(data){
        return window.btoa(String.fromCharCode.apply(null, data));
    },
        
    hexToBase64:function(value){
        if (value.length % 2) value = "0" + value;
        value = value.toLowerCase();
        var data = new Uint8Array(value.length/2);
        var pos = "0123456789abcdef";
        for(var i = 0,j = 0; i < value.length; i += 2,j++){
            data[j] = (pos.indexOf(value.charAt(i)) << 4) | (pos.indexOf(value.charAt(i + 1)));
        }
        return app.convertToBase64(data);
    },
        
    asciiToBase64:function(value){
        var data = new Uint8Array(value.length);
        for(var i = 0; i < value.length; i++){
            data[i] = value.charCodeAt(i);
        }
        return app.convertToBase64(data);
    },
        
    unicodeToBase64:function(value){
        var data = new Uint8Array(value.length*2);
        var str = "";
        for(var i = 0,j = 0; i < value.length; i++, j += 2){
            data[j] = value.charCodeAt(i) / 256;
            data[j+1] = value.charCodeAt(i) % 256;
        }
        return app.convertToBase64(data);
    },
        
    base64ToBuffer:function(rawData){
        var bytes = window.atob(rawData);
        var arraybuffer = new Uint8Array(bytes.length);
        for (var i = 0; i < bytes.length; i++) {
            arraybuffer[i] = bytes.charCodeAt(i);
        }
        return arraybuffer.buffer;
    },
    
    goBackToIndex:function(){
        $.mobile.changePage("index.html","slideup");
    },
    
    goBackToSearch:function(){
        $.mobile.changePage("searched.html","slideup");
    },
    
    goBackToIndex:function(){
        $.mobile.changePage("index.html","slideup");
    },
};
