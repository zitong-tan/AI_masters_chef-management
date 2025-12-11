1.在supabase上执行init.sql文件(前面配置web用户端已经执行过的话不用重复执行，只需要配置第二步信息)
2.替换.env.local中的supabase的配置信息为部署数据库的url和key
3.如果想使用本地数据库。可以尝试替换数据库url，在本地执行数据库文件，（需要修改代码配置，我没试过）
4.在.env配置文件中配置大语言模型和图片模型的url和apikey
5.打开终端
6.npm install
7.npm run serve
