cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/org.apache.cordova.dialogs/www/notification.js",
        "id": "org.apache.cordova.dialogs.notification",
        "merges": [
            "navigator.notification"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.dialogs/www/android/notification.js",
        "id": "org.apache.cordova.dialogs.notification_android",
        "merges": [
            "navigator.notification"
        ]
    },
    {
        "file": "plugins/org.bcsphere.bluetooth/www/bluetooth.js",
        "id": "org.bcsphere.bluetooth.bluetooth",
        "merges": [
            "navigator.bluetooth"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "org.apache.cordova.dialogs": "0.2.6",
    "org.bcsphere.bluetooth": "0.2.1"
}
// BOTTOM OF METADATA
});