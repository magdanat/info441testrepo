# Calls the build script
sh ./build.sh
# push first
docker login
docker push magdanat/finalclient

# need to change root IP address to new digital ocean droplet
ssh -oStrictHostKeyChecking=no root@167.172.112.80 'bash -s' < ./upgrade-client.sh
