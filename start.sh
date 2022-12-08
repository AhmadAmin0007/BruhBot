dir=$(pwd);

echo "You in folder $dir";
echo "[0] Start node.";
echo "[1] Install module.";
echo "[2] Uninstall module.";
echo "[3] Deploy to heroku. (Coming Soon)";
read -p "Select: " selected;
case $selected in
  0)
    clear;
    echo "Starting node..";
    node .
    ;;
  1)
    clear;
    echo "Install the module.";
    read -p "Module: " module;
    cp -r node_modules ~/installer;
    cp package.json ~/installer;
    cd ~/installer;
    eval "npm install $module";
    find ~/installer/node_modules -type d -name ".bin" -exec rm -rf {} +
    eval "cp -r node_modules $dir";
    eval "cp -r package.json $dir";
    rm package.json;
    rm package-lock.json;
    rm -rf node_modules;
    echo "Successfully install modules $module.";
    ;;
  2)
    clear;
    echo "Uninstall the module.";
    read -p "Module: " module;
    cp package.json ~/uninstaller;
    cp -r node_modules ~/uninstaller;
    cd ~/uninstaller;
    eval "npm uninstall $module";
    if [ $? ]
    then
      clear;
      echo "Please wait..";
      eval "rm -rf $dir/node_modules";
      find ~/uninstaller/node_modules -type d -name ".bin" -exec rm -rf {} +
      eval "cp -r node_modules $dir";
      eval "cp -r package.json $dir";
      rm -rf node_modules;
      rm package.json;
      rm package-lock.json;
      clear;
      echo "Successfully uninstall module $module.";
    else
      echo "Error!";
    fi
    ;;
  3)
    clear;
    echo "Coming Soon.";
    exit;
    ;;
  *)
    echo "Exit.";
    exit;
    ;;
esac