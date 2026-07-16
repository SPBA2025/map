/**
 * 埼玉県公園データ
 * 新しい公園を追加する場合は、この配列に追記してください。
 */

const parkData = [

  // === キャッチボール可能公園（PARKFUL調査：230件）===
  // さいたま市
  { id:10,  name:'岩槻文化公園',       city:'さいたま市', catchball:true, lat:35.9444, lng:139.7216, address:'さいたま市岩槻区大字村国' },
  { id:11,  name:'別所沼公園',         city:'さいたま市', catchball:true, lat:35.8565, lng:139.6411, address:'さいたま市南区別所四丁目' },
  { id:12,  name:'見沼自然公園',       city:'さいたま市', catchball:true, lat:35.9053, lng:139.6968, address:'さいたま市緑区大字南部領辻' },
  { id:13,  name:'三橋総合公園',       city:'さいたま市', catchball:true, lat:35.9117, lng:139.5976, address:'さいたま市西区三橋五丁目' },
  // 与野公園はid:2に登録済み
  { id:14,  name:'水判土公園',         city:'さいたま市', catchball:true, lat:35.9024, lng:139.5906, address:'さいたま市西区大字水判土' },
  { id:15,  name:'土屋公園',           city:'さいたま市', catchball:true, lat:35.9098, lng:139.5701, address:'さいたま市西区大字土屋' },
  { id:16,  name:'中元児童公園',       city:'さいたま市', catchball:true, lat:35.862, lng:139.6264, address:'さいたま市桜区南元宿二丁目' },
  // 川越市
  { id:17,  name:'増形緑地',           city:'川越市', catchball:true, lat:35.8927, lng:139.4231, address:'川越市大字増形' },
  { id:18,  name:'高階運動広場',       city:'川越市', catchball:true, lat:35.895704, lng:139.501314, address:'川越市大字砂' },
  { id:19,  name:'笠幡公園',           city:'川越市', catchball:true, lat:35.9224, lng:139.4122, address:'川越市川鶴二丁目' },
  { id:20,  name:'安比奈親水公園',     city:'川越市', catchball:true, lat:35.9016, lng:139.4253, address:'川越市大字安比奈新田' },
  { id:21,  name:'的場緑地',           city:'川越市', catchball:true, lat:35.906921, lng:139.434364, address:'川越市大字的場' },
  { id:22,  name:'霞ヶ関東緑地',       city:'川越市', catchball:true, lat:35.9234, lng:139.4419, address:'川越市霞ケ関東一丁目' },
  { id:23,  name:'市民グランド',       city:'川越市', catchball:true, lat:35.9318, lng:139.4868, address:'川越市宮元町' },
  { id:24,  name:'入間大橋緑地',       city:'川越市', catchball:true, lat:35.935659, lng:139.537073, address:'川越市大字東本宿' },
  { id:25,  name:'雁見緑地',           city:'川越市', catchball:true, lat:35.9327, lng:139.4612, address:'川越市大字鯨井' },
  { id:26,  name:'寺山緑地',           city:'川越市', catchball:true, lat:35.9314, lng:139.4677, address:'川越市大字上寺山' },
  { id:27,  name:'平塚緑地',           city:'川越市', catchball:true, lat:35.943375, lng:139.46658, address:'川越市大字平塚' },
  { id:28,  name:'上戸緑地',           city:'川越市', catchball:true, lat:35.9314, lng:139.4651, address:'川越市大字上寺山' },
  { id:29,  name:'高階南公共広場',     city:'川越市', catchball:true, lat:35.870279, lng:139.499157, address:'川越市大字砂新田' },
  { id:30,  name:'かほく運動公園',     city:'川越市', catchball:true, lat:35.9259, lng:139.4291, address:'川越市霞ケ関北六丁目' },
  { id:31,  name:'スポーツパーク福原', city:'川越市', catchball:true, lat:35.873814, lng:139.47571, address:'川越市大字今福' },
  // 熊谷市
  { id:32,  name:'船木台中央公園',     city:'熊谷市', catchball:true, lat:36.0746, lng:139.4206, address:'熊谷市船木台一丁目' },
  { id:33,  name:'別府沼公園',         city:'熊谷市', catchball:true, lat:36.1948, lng:139.3346, address:'熊谷市西別府' },
  { id:34,  name:'妻沼運動公園',       city:'熊谷市', catchball:true, lat:36.2244, lng:139.3582, address:'熊谷市飯塚' },
  { id:35,  name:'村岡荒川緑地',       city:'熊谷市', catchball:true, lat:36.131611, lng:139.38077, address:'熊谷市村岡' },
  { id:36,  name:'熊谷運動公園',       city:'熊谷市', catchball:true, lat:36.156, lng:139.3456, address:'熊谷市小島' },
  { id:37,  name:'みいずが原公園',     city:'熊谷市', catchball:true, lat:36.1645, lng:139.2985, address:'熊谷市御稜威ケ原' },
  { id:38,  name:'玉井緑地',           city:'熊谷市', catchball:true, lat:36.176353, lng:139.342596, address:'熊谷市玉井' },
  { id:39,  name:'妻沼東運動公園',     city:'熊谷市', catchball:true, lat:36.2247, lng:139.3607, address:'熊谷市飯塚' },
  { id:40,  name:'利根川総合運動公園', city:'熊谷市', catchball:true, lat:36.2207, lng:139.4066, address:'熊谷市善ケ島' },
  { id:41,  name:'久下荒川緑地',       city:'熊谷市', catchball:true, lat:36.125451, lng:139.400911, address:'熊谷市久下' },
  { id:42,  name:'江南総合公園',       city:'熊谷市', catchball:true, lat:36.1149, lng:139.3342, address:'熊谷市江南中央一丁目' },
  { id:43,  name:'万平公園',           city:'熊谷市', catchball:true, lat:36.1357, lng:139.3908, address:'熊谷市万平町一丁目' },
  { id:44,  name:'熊谷荒川緑地',       city:'熊谷市', catchball:true, lat:36.1472, lng:139.3886, address:'熊谷市宮町二丁目' },
  { id:45,  name:'荒川公園',           city:'熊谷市', catchball:true, lat:36.1367, lng:139.385, address:'熊谷市河原町二丁目' },
  { id:46,  name:'伊勢町ふれあい公園',           city:'熊谷市', catchball:true, lat:36.144559, lng:139.372733, address:'熊谷市伊勢町' },
  { id:47,  name:'中央公園',           city:'熊谷市', catchball:true, lat:36.1476, lng:139.3903, address:'熊谷市宮町二丁目' },
  { id:48,  name:'外原公園',           city:'熊谷市', catchball:true, lat:36.1714, lng:139.3122, address:'熊谷市拾六間' },
  { id:49,  name:'別府第2公園',        city:'熊谷市', catchball:true, lat:36.1827, lng:139.3395, address:'熊谷市別府四丁目' },
  { id:50,  name:'妻沼西第2公園',      city:'熊谷市', catchball:true, lat:36.2236, lng:139.3543, address:'熊谷市永井太田' },
  { id:51,  name:'籠原中央公園',       city:'熊谷市', catchball:true, lat:36.169, lng:139.328, address:'熊谷市籠原南二丁目' },
  // 川口市
  { id:52,  name:'柳崎公園',           city:'川口市', catchball:true, lat:35.8559, lng:139.6998, address:'川口市柳崎四丁目' },
  { id:53,  name:'中青木公園',         city:'川口市', catchball:true, lat:35.8132, lng:139.7184, address:'川口市中青木三丁目' },
  { id:54,  name:'新郷西沼公園',       city:'川口市', catchball:true, lat:35.8215, lng:139.755, address:'川口市江戸一丁目' },
  { id:55,  name:'戸塚赤道公園',       city:'川口市', catchball:true, lat:35.8678, lng:139.7538, address:'川口市戸塚東三丁目' },
  { id:56,  name:'戸塚藤谷公園',       city:'川口市', catchball:true, lat:35.865, lng:139.744, address:'川口市戸塚南四丁目' },
  { id:57,  name:'戸塚杉本公園',       city:'川口市', catchball:true, lat:35.8746, lng:139.7519, address:'川口市戸塚東一丁目' },
  { id:58,  name:'新郷東部公園',       city:'川口市', catchball:true, lat:35.8305, lng:139.778, address:'川口市大字峯' },
  // 行田市
  { id:59,  name:'つきみちした公園',   city:'行田市', catchball:true, lat:36.096238, lng:139.485359, address:'行田市大字野' },
  { id:60,  name:'棚田中央公園',       city:'行田市', catchball:true, lat:36.1243, lng:139.4355, address:'行田市棚田町一丁目' },
  { id:61,  name:'鶴土井公園',         city:'行田市', catchball:true, lat:36.1243, lng:139.4428, address:'行田市門井町三丁目' },
  { id:62,  name:'持田南公園',         city:'行田市', catchball:true, lat:36.131083, lng:139.433007, address:'行田市持田五丁目' },
  { id:63,  name:'向町公園',           city:'行田市', catchball:true, lat:36.136938, lng:139.463516, address:'行田市向町' },
  { id:64,  name:'行田市総合公園',     city:'行田市', catchball:true, lat:36.1544, lng:139.4509, address:'行田市大字和田' },
  { id:65,  name:'見沼元圦公園',       city:'行田市', catchball:true, lat:36.1816, lng:139.4722, address:'行田市大字須加' },
  { id:66,  name:'古代蓮の里',         city:'行田市', catchball:true, lat:36.1322, lng:139.5003, address:'行田市大字小針' },
  { id:67,  name:'つるまき公園',       city:'行田市', catchball:true, lat:36.135812, lng:139.479187, address:'行田市長野五丁目' },
  { id:68,  name:'長野中央公園',       city:'行田市', catchball:true, lat:36.1439, lng:139.4719, address:'行田市長野一丁目' },
  // 所沢市
  { id:69,  name:'東所沢公園',         city:'所沢市', catchball:true, lat:35.798, lng:139.5095, address:'所沢市東所沢和田三丁目' },
  { id:70,  name:'亀ヶ谷公園',         city:'所沢市', catchball:true, lat:35.8044, lng:139.5179, address:'所沢市東所沢三丁目' },
  { id:71,  name:'椿峰中央公園',       city:'所沢市', catchball:true, lat:35.7832, lng:139.437, address:'所沢市大字山口' },
  { id:72,  name:'北野公園',           city:'所沢市', catchball:true, lat:35.7989, lng:139.4338, address:'所沢市小手指町四丁目' },
  { id:73,  name:'滝の城址公園',       city:'所沢市', catchball:true, lat:35.8003, lng:139.5334, address:'所沢市大字城' },
  { id:74,  name:'所沢カルチャーパーク', city:'所沢市', catchball:true, lat:35.8034, lng:139.4942, address:'所沢市大字下新井' },
  { id:75,  name:'緑町中央公園',       city:'所沢市', catchball:true, lat:35.8043, lng:139.4521, address:'所沢市緑町一丁目' },
  // 飯能市
  { id:76,  name:'阿須運動公園',       city:'飯能市', catchball:true, lat:35.832562, lng:139.341492, address:'飯能市大字阿須' },
  { id:77,  name:'岩沢運動公園',       city:'飯能市', catchball:true, lat:35.83445, lng:139.341347, address:'飯能市大字岩沢' },
  // 加須市
  { id:78,  name:'ふるさと広場',       city:'加須市', catchball:true, lat:36.084705, lng:139.565595, address:'加須市中種足' },
  { id:79,  name:'藤ノ木公園',         city:'加須市', catchball:true, lat:36.090287, lng:139.582222, address:'加須市鴻茎' },
  { id:80,  name:'けやき公園',         city:'加須市', catchball:true, lat:36.0959, lng:139.578, address:'加須市西ノ谷' },
  { id:81,  name:'騎西城山公園',       city:'加須市', catchball:true, lat:36.103838, lng:139.582557, address:'加須市外川' },
  { id:82,  name:'騎西中央公園',       city:'加須市', catchball:true, lat:36.1072, lng:139.5754, address:'加須市騎西' },
  { id:83,  name:'騎西総合公園',       city:'加須市', catchball:true, lat:36.108953, lng:139.578649, address:'加須市正能' },
  { id:84,  name:'花崎北公園',         city:'加須市', catchball:true, lat:36.1122, lng:139.6359, address:'加須市花崎北二丁目' },
  { id:85,  name:'豊野台公園',         city:'加須市', catchball:true, lat:36.1213, lng:139.6666, address:'加須市豊野台二丁目' },
  { id:86,  name:'かぞインター公園',   city:'加須市', catchball:true, lat:36.122184, lng:139.637933, address:'加須市大桑二丁目' },
  { id:87,  name:'加須市民運動公園',   city:'加須市', catchball:true, lat:36.136703, lng:139.601047, address:'加須市下三俣' },
  { id:88,  name:'大利根運動公園',     city:'加須市', catchball:true, lat:36.1368, lng:139.6669, address:'加須市琴寄' },
  { id:89,  name:'加須北部公園',       city:'加須市', catchball:true, lat:36.146159, lng:139.642994, address:'加須市古川二丁目' },
  { id:90,  name:'大利根西部公園',     city:'加須市', catchball:true, lat:36.1806, lng:139.6187, address:'加須市大越' },
  { id:91,  name:'旧川ふるさと公園',   city:'加須市', catchball:true, lat:36.1764, lng:139.68, address:'加須市伊賀袋' },
  { id:92,  name:'不動岡北みどり公園', city:'加須市', catchball:true, lat:36.133, lng:139.5921, address:'加須市不動岡一丁目' },
  { id:93,  name:'鎮守前公園',         city:'加須市', catchball:true, lat:36.120012, lng:139.624992, address:'加須市南篠崎二丁目' },
  { id:94,  name:'渡良瀬総合グラウンド', city:'加須市', catchball:true, lat:36.2048, lng:139.6723, address:'加須市小野袋' },
  // 本庄市
  { id:95,  name:'本庄市万年寺下公園', city:'本庄市', catchball:true, lat:36.2541, lng:139.1673, address:'本庄市小島' },
  { id:96,  name:'本庄市城下公園',     city:'本庄市', catchball:true, lat:36.2438, lng:139.1933, address:'本庄市本庄三丁目' },
  { id:97,  name:'本庄市宮内公園',     city:'本庄市', catchball:true, lat:36.1827, lng:139.0818, address:'本庄市児玉町宮内' },
  // 東松山市
  { id:98,  name:'松風公園',           city:'東松山市', catchball:true, lat:35.9948, lng:139.3806, address:'東松山市松風台' },
  { id:99,  name:'唐子中央公園',       city:'東松山市', catchball:true, lat:36.028109, lng:139.364168, address:'東松山市大字下唐子' },
  { id:100, name:'五領沼公園',         city:'東松山市', catchball:true, lat:36.0307, lng:139.4106, address:'東松山市若松町一丁目' },
  { id:101, name:'五領町近隣公園',     city:'東松山市', catchball:true, lat:36.0311, lng:139.4158, address:'東松山市五領町' },
  { id:102, name:'岩鼻運動公園',       city:'東松山市', catchball:true, lat:36.0512, lng:139.4132, address:'東松山市大字松山' },
  { id:103, name:'折本山公園',         city:'東松山市', catchball:true, lat:36.0028, lng:139.4093, address:'東松山市あずま町四丁目' },
  { id:104, name:'新郷公園',           city:'東松山市', catchball:true, lat:36.037567, lng:139.364725, address:'東松山市大字新郷' },
  { id:105, name:'千年谷公園',         city:'東松山市', catchball:true, lat:35.9912, lng:139.3816, address:'東松山市旗立台' },
  { id:106, name:'駒形公園',           city:'東松山市', catchball:true, lat:36.0422, lng:139.4, address:'東松山市松葉町一丁目' },
  // 春日部市
  { id:107, name:'薬師沼親水公園',     city:'春日部市', catchball:true, lat:35.9537, lng:139.7935, address:'春日部市赤沼' },
  { id:108, name:'豊野町第１公園',     city:'春日部市', catchball:true, lat:35.958, lng:139.7935, address:'春日部市豊野町二丁目' },
  { id:109, name:'谷原第１公園',       city:'春日部市', catchball:true, lat:35.9723, lng:139.7457, address:'春日部市谷原一丁目' },
  { id:110, name:'八幡公園',           city:'春日部市', catchball:true, lat:35.9819, lng:139.7432, address:'春日部市粕壁' },
  { id:111, name:'南栄町第１近隣公園', city:'春日部市', catchball:true, lat:35.9828, lng:139.738, address:'春日部市南栄町' },
  { id:112, name:'牛島公園',           city:'春日部市', catchball:true, lat:35.9856, lng:139.7711, address:'春日部市牛島' },
  { id:113, name:'庄和総合公園',       city:'春日部市', catchball:true, lat:35.9909, lng:139.8016, address:'春日部市金崎' },
  { id:114, name:'旧倉松公園',         city:'春日部市', catchball:true, lat:35.9909, lng:139.7606, address:'春日部市八丁目' },
  { id:115, name:'大枝公園',           city:'春日部市', catchball:true, lat:35.9423, lng:139.7751, address:'春日部市大枝' },
  { id:116, name:'大凧公園',           city:'春日部市', catchball:true, lat:36.0328, lng:139.8118, address:'春日部市西宝珠花' },
  { id:117, name:'東中野近隣公園',      city:'春日部市', catchball:true, lat:35.9707, lng:139.8196, address:'春日部市東中野' },
  { id:118, name:'一の割公園',         city:'春日部市', catchball:true, lat:35.9592, lng:139.7588, address:'春日部市一ノ割' },
  { id:119, name:'大沼公園',           city:'春日部市', catchball:true, lat:35.9656, lng:139.7474, address:'春日部市大沼一丁目' },
  { id:120, name:'川久保公園',         city:'春日部市', catchball:true, lat:35.9786, lng:139.7721, address:'春日部市緑町二丁目' },
  { id:121, name:'内牧公園',           city:'春日部市', catchball:true, lat:35.99, lng:139.7222, address:'春日部市内牧' },
  // 狭山市
  { id:123, name:'狭山稲荷山公園',     city:'狭山市', catchball:true, lat:35.8482, lng:139.3982, address:'狭山市稲荷山一丁目' },
  { id:124, name:'鵜ノ木運動公園',     city:'狭山市', catchball:true, lat:35.8503, lng:139.3938, address:'狭山市鵜ノ木' },
  { id:125, name:'狭山台中央公園',     city:'狭山市', catchball:true, lat:35.8551, lng:139.434, address:'狭山市狭山台三丁目' },
  { id:126, name:'上奥富運動公園',     city:'狭山市', catchball:true, lat:35.8726, lng:139.4117, address:'狭山市大字上奥富' },
  { id:127, name:'智光山公園',         city:'狭山市', catchball:true, lat:35.8814, lng:139.3936, address:'狭山市柏原' },
  { id:128, name:'新狭山公園',         city:'狭山市', catchball:true, lat:35.8838, lng:139.4411, address:'狭山市新狭山一丁目' },
  { id:129, name:'堀兼・上赤坂公園',   city:'狭山市', catchball:true, lat:35.8503, lng:139.4435, address:'狭山市大字堀兼' },
  { id:130, name:'広瀬台虹の橋公園',   city:'狭山市', catchball:true, lat:35.8675, lng:139.3914, address:'狭山市大字上広瀬' },
  // 鴻巣市
  { id:131, name:'下忍第一公園',       city:'鴻巣市', catchball:true, lat:36.1019, lng:139.4623, address:'鴻巣市下忍' },
  { id:132, name:'筑波児童公園',       city:'鴻巣市', catchball:true, lat:36.1027, lng:139.459, address:'鴻巣市筑波一丁目' },
  { id:133, name:'下忍第二公園',       city:'鴻巣市', catchball:true, lat:36.1054, lng:139.4641, address:'鴻巣市下忍' },
  { id:134, name:'袋ふれあい公園',     city:'鴻巣市', catchball:true, lat:36.1025, lng:139.4737, address:'鴻巣市袋' },
  // 深谷市
  { id:135, name:'白草台運動公園',     city:'深谷市', catchball:true, lat:36.123782, lng:139.301183, address:'深谷市白草台' },
  { id:136, name:'仙元山公園',         city:'深谷市', catchball:true, lat:36.177494, lng:139.270373, address:'深谷市人見' },
  { id:137, name:'上柴中央公園',       city:'深谷市', catchball:true, lat:36.182182, lng:139.296442, address:'深谷市上柴町西四丁目' },
  { id:138, name:'北部運動公園',       city:'深谷市', catchball:true, lat:36.222528, lng:139.276299, address:'深谷市起会' },
  { id:139, name:'花園総合運動公園',   city:'深谷市', catchball:true, lat:36.135744, lng:139.226916, address:'深谷市小前田' },
  { id:140, name:'柴崎公園',           city:'深谷市', catchball:true, lat:36.180028, lng:139.308559, address:'深谷市上柴町東二丁目' },
  { id:141, name:'東公園',             city:'深谷市', catchball:true, lat:36.187725, lng:139.300075, address:'深谷市幡羅町一丁目' },
  { id:142, name:'東方公園',           city:'深谷市', catchball:true, lat:36.18869, lng:139.31397, address:'深谷市東方町二丁目' },
  { id:143, name:'常盤公園',           city:'深谷市', catchball:true, lat:36.195856, lng:139.299137, address:'深谷市常盤町' },
  { id:144, name:'花園水辺公園',       city:'深谷市', catchball:true, lat:36.120186, lng:139.22065, address:'深谷市小前田' },
  // 上尾市
  { id:145, name:'平塚公園',           city:'上尾市', catchball:true, lat:35.9875, lng:139.6099, address:'上尾市大字平塚' },
  { id:146, name:'上平公園',           city:'上尾市', catchball:true, lat:35.992, lng:139.5934, address:'上尾市大字菅谷' },
  { id:147, name:'ゆりが丘公園',       city:'上尾市', catchball:true, lat:35.9621, lng:139.5749, address:'上尾市向山四丁目' },
  { id:148, name:'こどもの城公園',     city:'上尾市', catchball:true, lat:35.9628, lng:139.5688, address:'上尾市大字今泉' },
  { id:149, name:'浅間台大公園',       city:'上尾市', catchball:true, lat:35.977, lng:139.5705, address:'上尾市浅間台三丁目' },
  { id:150, name:'鴨川中央公園',       city:'上尾市', catchball:true, lat:35.9845, lng:139.5627, address:'上尾市中妻五丁目' },
  { id:151, name:'上尾丸山公園',       city:'上尾市', catchball:true, lat:35.9568, lng:139.5476, address:'上尾市大字平方' },
  { id:152, name:'小泉氷川山公園',     city:'上尾市', catchball:true, lat:35.9737, lng:139.5649, address:'上尾市小泉八丁目' },
  { id:153, name:'中分スポーツ公園',   city:'上尾市', catchball:true, lat:35.9704, lng:139.558, address:'上尾市中分一丁目' },
  // 草加市
  { id:154, name:'谷塚第6公園',        city:'草加市', catchball:true, lat:35.8117, lng:139.8011, address:'草加市谷塚一丁目' },
  // 越谷市
  { id:155, name:'レイクタウン湖畔の森公園', city:'越谷市', catchball:true, lat:35.8812, lng:139.8176, address:'越谷市レイクタウン九丁目' },
  { id:156, name:'レイクタウンスポーツ公園', city:'越谷市', catchball:true, lat:35.8826, lng:139.8124, address:'越谷市レイクタウン一丁目' },
  // 戸田市
  // 戸田市: 市提供の公式一覧（令和8年7月時点・バッティング禁止）に基づく official 付き8件＋公式情報による不可1件
  { id:157, name:'彩湖・道満グリーンパーク', city:'戸田市', catchball:true, lat:35.825, lng:139.6308, address:'戸田市大字重瀬745番外',
    official:{ city:'戸田市', asOf:'令和8年7月', hours:'4月～10月 7:30～18:30／11月～3月 7:30～17:30' } },
  { id:158, name:'ボール公園',         city:'戸田市', catchball:true, lat:35.8252, lng:139.6594, address:'戸田市大字下笹目116-4外',
    official:{ city:'戸田市', asOf:'令和8年7月', hours:'8:30～20:00（12/29～1/3は使用不可）', note:'公園内多目的広場にて可能' } },
  // 芦原ちびっ子広場: 戸田市の公式情報によりキャッチボール不可。旧データは市役所位置に誤登録＋可になっていたため修正（2026-07 市より依頼）
  { id:159, name:'芦原ちびっ子広場',   city:'戸田市', catchball:false, lat:35.826164, lng:139.66301, address:'戸田市大字新曽1604-1外',
    notes:'戸田市の公式情報によりキャッチボール不可（令和8年7月時点）' },
  { id:244, name:'青少年の広場（とちのき広場）', city:'戸田市', catchball:true, lat:35.805444, lng:139.680127, address:'戸田市本町5丁目2122-1',
    official:{ city:'戸田市', asOf:'令和8年7月', name:'本町青少年の広場', hours:'6:00～21:30' } },
  { id:245, name:'中町青少年の広場',   city:'戸田市', catchball:true, lat:35.80788, lng:139.690308, address:'戸田市中町2丁目8番（中町多目的広場内）',
    official:{ city:'戸田市', asOf:'令和8年7月', hours:'3/15～4/30 9:00～17:30／5/1～9/30 9:00～19:00／10/1～3/14 9:00～16:30' } },
  { id:246, name:'新曽青少年の広場',   city:'戸田市', catchball:true, lat:35.81435, lng:139.667725, address:'戸田市大字新曽766番地',
    official:{ city:'戸田市', asOf:'令和8年7月', hours:'3/15～4/30 9:00～17:30／5/1～9/30 9:00～19:00／10/1～3/14 9:00～16:30' } },
  { id:247, name:'新田口公園',         city:'戸田市', catchball:true, lat:35.812267, lng:139.671249, address:'戸田市上戸田5丁目28-1外',
    official:{ city:'戸田市', asOf:'令和8年7月', note:'公園内ボール遊び広場にて可能' } },
  { id:248, name:'喜沢二丁目児童遊園地', city:'戸田市', catchball:true, lat:35.809544, lng:139.695282, address:'戸田市喜沢2丁目20-5外',
    official:{ city:'戸田市', asOf:'令和8年7月', note:'公園内ボール遊び広場にて可能' } },
  { id:249, name:'番匠免公園',         city:'戸田市', catchball:true, lat:35.828896, lng:139.635147, address:'戸田市美女木8丁目6番',
    official:{ city:'戸田市', asOf:'令和8年7月', hours:'3/15～4/30 8:30～17:30／5/1～8/31 8:30～18:00／9/1～9/30 8:30～17:30／10/1～3/14 8:30～16:30（12/29～1/3使用不可）', note:'公園内ボール遊び広場にて可能' } },
  // 入間市
  { id:160, name:'富士見公園',         city:'入間市', catchball:true, lat:35.8314, lng:139.3969, address:'入間市東町一丁目' },
  { id:162, name:'彩の森入間公園',     city:'入間市', catchball:true, lat:35.8373, lng:139.3992, address:'入間市向陽台二丁目' },
  { id:163, name:'新光中央公園',       city:'入間市', catchball:true, lat:35.8559, lng:139.3591, address:'入間市大字新光' },
  // 朝霞市
  { id:164, name:'朝霞中央公園',       city:'朝霞市', catchball:true, lat:35.7914, lng:139.5948, address:'朝霞市青葉台一丁目' },
  { id:165, name:'北朝霞公園',         city:'朝霞市', catchball:true, lat:35.8183, lng:139.5893, address:'朝霞市北原一丁目' },
  { id:166, name:'いずみ公園',         city:'朝霞市', catchball:true, lat:35.8004, lng:139.5755, address:'朝霞市泉水一丁目' },
  { id:167, name:'青葉台公園',         city:'朝霞市', catchball:true, lat:35.7954, lng:139.5907, address:'朝霞市大字膝折' },
  // 新座市
  { id:168, name:'総合運動公園',       city:'新座市', catchball:true, lat:35.787, lng:139.5501, address:'新座市本多二丁目' },
  // 桶川市
  { id:169, name:'城山公園',           city:'桶川市', catchball:true, lat:35.9908, lng:139.5244, address:'桶川市大字川田谷' },
  { id:170, name:'駅西口公園',         city:'桶川市', catchball:true, lat:35.997, lng:139.5611, address:'桶川市若宮一丁目' },
  { id:171, name:'桶川市子ども公園わんぱく村', city:'桶川市', catchball:true, lat:36.0195, lng:139.573, address:'桶川市大字坂田' },
  { id:172, name:'舎人公園',           city:'桶川市', catchball:true, lat:36.0258, lng:139.5765, address:'桶川市赤堀一丁目' },
  { id:173, name:'下日出谷中央公園',   city:'桶川市', catchball:true, lat:35.9975, lng:139.5465, address:'桶川市大字下日出谷' },
  // 久喜市
  { id:175, name:'権現堂公園',         city:'久喜市', catchball:true, lat:36.1097, lng:139.7246, address:'久喜市小右衛門' },
  { id:176, name:'森下緑地グラウンド', city:'久喜市', catchball:true, lat:36.049716, lng:139.575847, address:'久喜市菖蒲町下栢間' },
  { id:177, name:'久喜市総合運動公園', city:'久喜市', catchball:true, lat:36.0556, lng:139.6594, address:'久喜市江面' },
  { id:178, name:'清久公園',           city:'久喜市', catchball:true, lat:36.0697, lng:139.6309, address:'久喜市清久町' },
  { id:179, name:'桜田運動公園',       city:'久喜市', catchball:true, lat:36.092, lng:139.6799, address:'久喜市桜田一丁目' },
  { id:180, name:'上大崎運動公園',     city:'久喜市', catchball:true, lat:36.056041, lng:139.603276, address:'久喜市菖蒲町上大崎' },
  { id:181, name:'あやめ公園',         city:'久喜市', catchball:true, lat:36.066792, lng:139.599513, address:'久喜市菖蒲町新堀' },
  { id:182, name:'寺田緑地グラウンド', city:'久喜市', catchball:true, lat:36.0669, lng:139.61, address:'久喜市菖蒲町菖蒲' },
  { id:183, name:'青葉公園',           city:'久喜市', catchball:true, lat:36.0712, lng:139.6962, address:'久喜市青葉三丁目' },
  // 北本市
  { id:184, name:'深井スポーツ広場',   city:'北本市', catchball:true, lat:36.0451, lng:139.5329, address:'北本市深井四丁目' },
  { id:185, name:'天神下公園',         city:'北本市', catchball:true, lat:36.008, lng:139.5047, address:'北本市大字石戸宿' },
  { id:186, name:'高尾スポーツ広場',   city:'北本市', catchball:true, lat:36.0288, lng:139.5031, address:'北本市大字高尾' },
  { id:187, name:'中丸スポーツ広場',   city:'北本市', catchball:true, lat:36.026, lng:139.5532, address:'北本市中丸九丁目' },
  // 蓮田市
  { id:188, name:'黒浜公園',           city:'蓮田市', catchball:true, lat:35.9999, lng:139.6729, address:'蓮田市大字黒浜' },
  { id:189, name:'堂山公園',           city:'蓮田市', catchball:true, lat:35.9862, lng:139.6553, address:'蓮田市上二丁目' },
  { id:190, name:'根ヶ谷戸公園',       city:'蓮田市', catchball:true, lat:35.9719, lng:139.6556, address:'蓮田市馬込三丁目' },
  { id:191, name:'山ノ内公園',         city:'蓮田市', catchball:true, lat:35.9878, lng:139.6448, address:'蓮田市大字蓮田' },
  { id:192, name:'西城沼公園',         city:'蓮田市', catchball:true, lat:35.9997, lng:139.6575, address:'蓮田市大字城' },
  { id:193, name:'中道公園',           city:'蓮田市', catchball:true, lat:36.0039, lng:139.6513, address:'蓮田市西新宿三丁目' },
  // 坂戸市
  { id:194, name:'芦山公園',           city:'坂戸市', catchball:true, lat:35.9715, lng:139.401, address:'坂戸市芦山町' },
  { id:195, name:'坂戸市民総合運動公園', city:'坂戸市', catchball:true, lat:35.9776, lng:139.4134, address:'坂戸市大字石井' },
  { id:196, name:'稲荷久保公園',       city:'坂戸市', catchball:true, lat:35.9566, lng:139.4081, address:'坂戸市千代田四丁目' },
  { id:197, name:'溝端公園',           city:'坂戸市', catchball:true, lat:35.9732, lng:139.3939, address:'坂戸市溝端町' },
  // 幸手市
  { id:198, name:'神扇グラウンド',     city:'幸手市', catchball:true, lat:36.0599, lng:139.7438, address:'幸手市大字神扇' },
  { id:199, name:'幸手総合公園',       city:'幸手市', catchball:true, lat:36.0828, lng:139.7518, address:'幸手市大字木立' },
  { id:200, name:'上吉羽中央公園',     city:'幸手市', catchball:true, lat:36.085256, lng:139.743438, address:'幸手市大字上吉羽' },
  { id:201, name:'上吉羽西公園',       city:'幸手市', catchball:true, lat:36.085991, lng:139.740633, address:'幸手市大字上吉羽' },
  { id:202, name:'千塚西公園',         city:'幸手市', catchball:true, lat:36.0907, lng:139.702, address:'幸手市大字千塚' },
  // 鶴ヶ島市
  { id:203, name:'鶴ヶ島市運動公園',   city:'鶴ヶ島市', catchball:true, lat:35.9218, lng:139.3992, address:'鶴ヶ島市大字太田ヶ谷' },
  { id:204, name:'鶴ヶ島南近隣公園',   city:'鶴ヶ島市', catchball:true, lat:35.9257, lng:139.4126, address:'鶴ヶ島市松ヶ丘五丁目' },
  { id:205, name:'脚折近隣公園',       city:'鶴ヶ島市', catchball:true, lat:35.9499, lng:139.3909, address:'鶴ヶ島市脚折町二丁目' },
  { id:206, name:'富士見中央近隣公園', city:'鶴ヶ島市', catchball:true, lat:35.9533, lng:139.4151, address:'鶴ヶ島市富士見四丁目' },
  // 日高市
  { id:207, name:'巾着田曼珠沙華公園', city:'日高市', catchball:true, lat:35.8828, lng:139.3115, address:'日高市大字高麗本郷' },
  { id:208, name:'日高総合公園',       city:'日高市', catchball:true, lat:35.900394, lng:139.381533, address:'日高市大字高萩' },
  { id:209, name:'丘の上公園',         city:'日高市', catchball:true, lat:35.8718, lng:139.2819, address:'日高市横手二丁目' },
  // ふじみ野市
  { id:210, name:'西ノ原中央公園',     city:'ふじみ野市', catchball:true, lat:35.8551, lng:139.52, address:'ふじみ野市うれし野一丁目' },
  { id:211, name:'福岡中央公園',       city:'ふじみ野市', catchball:true, lat:35.8749, lng:139.5174, address:'ふじみ野市上野台一丁目' },
  // 白岡市
  { id:212, name:'高岩公園',           city:'白岡市', catchball:true, lat:36.0313, lng:139.674, address:'白岡市新白岡三丁目' },
  { id:213, name:'ふれあいの森公園',   city:'白岡市', catchball:true, lat:36.0198, lng:139.676, address:'白岡市小久喜' },
  { id:214, name:'白岡公園',           city:'白岡市', catchball:true, lat:36.0197, lng:139.6515, address:'白岡市西五丁目' },
  { id:215, name:'白岡市総合運動公園', city:'白岡市', catchball:true, lat:36.0146, lng:139.6802, address:'白岡市千駄野' },
  // 伊奈町
  { id:216, name:'伊奈町制施行記念公園', city:'伊奈町', catchball:true, lat:36.014, lng:139.6089, address:'伊奈町大字羽貫' },
  { id:217, name:'内宿台公園',         city:'伊奈町', catchball:true, lat:36.0187, lng:139.6037, address:'伊奈町内宿台五丁目' },
  { id:218, name:'中部公園',           city:'伊奈町', catchball:true, lat:35.9998, lng:139.619, address:'伊奈町中央五丁目' },
  // 毛呂山町
  { id:219, name:'毛呂山総合公園',     city:'毛呂山町', catchball:true, lat:35.9211, lng:139.3086, address:'毛呂山町大字大谷木' },
  // 滑川町
  { id:220, name:'都第一公園',         city:'滑川町', catchball:true, lat:36.0407, lng:139.3657, address:'滑川町大字都' },
  // 嵐山町
  { id:221, name:'菅谷公園',           city:'嵐山町', catchball:true, lat:36.0411, lng:139.3229, address:'嵐山町大字菅谷' },
  { id:222, name:'蜻蛉橋上緑地',       city:'嵐山町', catchball:true, lat:36.0565, lng:139.3206, address:'嵐山町大字廣野' },
  { id:223, name:'志賀２区第１公園',   city:'嵐山町', catchball:true, lat:36.0484, lng:139.3183, address:'嵐山町大字志賀' },
  { id:224, name:'花見台第２公園',     city:'嵐山町', catchball:true, lat:36.077195, lng:139.313011, address:'嵐山町花見台' },
  { id:225, name:'花見台第１公園',     city:'嵐山町', catchball:true, lat:36.076684, lng:139.322869, address:'嵐山町花見台' },
  // 小川町
  { id:226, name:'みどりが丘中央公園', city:'小川町', catchball:true, lat:36.0685, lng:139.2575, address:'小川町みどりが丘三丁目' },
  // 吉見町
  { id:227, name:'吉見南部緑地河川敷グラウンド',           city:'吉見町', catchball:true, lat:36.018021, lng:139.466138, address:'吉見町大字大串' },
  { id:228, name:'東部緑地',           city:'吉見町', catchball:true, lat:36.018714, lng:139.488249, address:'吉見町大字飯島新田' },
  { id:229, name:'ふれあい広場',       city:'吉見町', catchball:true, lat:36.0524, lng:139.4494, address:'吉見町大字黒岩' },
  // 皆野町
  { id:230, name:'皆野スポーツ公園',   city:'皆野町', catchball:true, lat:36.0708, lng:139.0988, address:'皆野町大字皆野' },
  // 神川町
  { id:231, name:'新宿ふれあい公園',   city:'神川町', catchball:true, lat:36.1884, lng:139.0702, address:'神川町大字新宿' },
  { id:232, name:'神川ゆ～ゆ～ランド', city:'神川町', catchball:true, lat:36.2063, lng:139.0762, address:'神川町大字小浜' },
  // 上里町
  { id:233, name:'烏川・神流川総合運動公園', city:'上里町', catchball:true, lat:36.2517, lng:139.1449, address:'上里町大字七本木' },
  // 寄居町
  { id:234, name:'寄居運動公園',       city:'寄居町', catchball:true, lat:36.1064, lng:139.1849, address:'寄居町大字折原' },
  // 宮代町
  { id:235, name:'はらっパーク宮代',   city:'宮代町', catchball:true, lat:36.0054, lng:139.7155, address:'宮代町字金原' },
  // 杉戸町
  { id:236, name:'杉戸西近隣公園',     city:'杉戸町', catchball:true, lat:36.0504, lng:139.7079, address:'杉戸町高野台西四丁目' },
  { id:237, name:'倉松公園',           city:'杉戸町', catchball:true, lat:36.0369, lng:139.7463, address:'杉戸町大字倉松' },
  // 松伏町
  { id:239, name:'まつぶし緑の丘公園', city:'松伏町', catchball:true, lat:35.9461, lng:139.8098, address:'松伏町大字大川戸' },
  { id:240, name:'田島東公園',         city:'松伏町', catchball:true, lat:35.931, lng:139.8403, address:'松伏町田島東' },
  { id:241, name:'松伏記念公園',       city:'松伏町', catchball:true, lat:35.9231, lng:139.83, address:'松伏町ゆめみ野東三丁目' },
  { id:242, name:'松伏総合公園',       city:'松伏町', catchball:true, lat:35.9196, lng:139.83, address:'松伏町ゆめみ野東四丁目' },
  { id:243, name:'かがり火公園',       city:'松伏町', catchball:true, lat:35.9307, lng:139.8187, address:'松伏町大字松伏' },

];

/**
 * 運営からのお知らせ（「最近の更新」に表示。新しい順に並ぶよう date を正しく入れる）
 * { date:'YYYY-MM-DD', title:'…', lat, lng, zoom } — タップで lat/lng へ移動（モーダルは開かない）
 */
const parkNews = [
  { date: '2026-07-16', title: '戸田市公認のキャッチボールができる公園 8か所を掲載', lat: 35.814, lng: 139.668, zoom: 14 },
];
