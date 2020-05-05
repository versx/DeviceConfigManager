1: INSTALL REQUIREMENTS (cd to directory of listener.js and package.json)  
npm install  
npm install pm2 -g  
brew update  
brew uninstall --ignore-dependencies libimobiledevice  
brew uninstall --ignore-dependencies usbmuxd  
brew install --HEAD usbmuxd  
brew unlink usbmuxd && brew link usbmuxd  
brew install --HEAD libimobiledevice  
brew link --overwrite libimobiledevice  
brew install ideviceinstaller  
brew link --overwrite ideviceinstaller  
sudo chmod -R 777 /var/db/lockdown/  

2: Edit Two Basic confings inside listener.js at the top.  

3: START THE BOT  
Start with `pm2 start listener.js`  
