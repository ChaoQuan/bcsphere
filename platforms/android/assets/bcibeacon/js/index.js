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
var ProximityUUID = "e2c56db5-dffb-48d2-b060-d0f5a71096e0";
//var ProximityUUID = "00000000-0000-0000-0000-000000000000";

var app = {
	webView : null,
	
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('bcready', this.onBCReady, false);
        document.addEventListener('newibeacon', this.onNewIBeacon, false);
		document.addEventListener('ibeaconproximityupdate', this.onIBeaconProximityChange,false);
    },

	onIBeaconProximityChange : function(arg){
		var ibeacon = BC.bluetooth.ibeacons[arg.iBeaconID];
		app.visitWebPage(ibeacon);
	},
	
    onBCReady: function() {
        BC.Bluetooth.StartIBeaconScan(ProximityUUID);
    },
	
	onNewIBeacon : function(arg){
		var ibeacon = BC.bluetooth.ibeacons[arg.iBeaconID];
		app.visitWebPage(ibeacon);
	},
	
	visitWebPage : function(ibeacon){
		if(ibeacon.proximityUUID == ProximityUUID){
			if(ibeacon.proximity >= 2 && app.webView !== null){
				app.webView.close();
				app.webView = null;
			}else if(ibeacon.proximity == 1 && app.webView == null){
				app.webView = window.open('http://www.bcsphere.net/portal.php?mod=topic&topicid=2', '_blank', 'location=yes');
				//webView = window.open('http://www.bcsphere.org/bcmeeting.html', '_blank', 'location=no');
			}
		}
	},

};












