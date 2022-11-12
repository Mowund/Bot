#!/bin/bash
cd /home/ec2-user/app/
sudo cp /.env /home/ec2-user/app
sudo yarn install --production
