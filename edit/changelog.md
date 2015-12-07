```
添加了editor.md的必须包

增加了
<link rel="stylesheet" href="/static/edit/css/edit-plus.css">

修改了
<script src="/static/edit/js/edit.js"></script>
edit.html
```

{
   "data-url": "",                 图片地址 要带后缀
   "data-alt": "",                 图片alt
   "data-link": ""                 图片指向链接
}

// 任意dialog打开 即实例化完毕都可以调用setDialogLocation方法 设置添加地址
// 添加完毕后就可以点击upload dialog确定按钮 添加图片链接
// dialogReady
window.dialogReady = function() {
   $("body").click(function() {
	   window.setDialogLocation(window.uploadDialog, {
		   "data-url": "http://www.baidu.com/logo.png",
		   "data-alt": "baidu",
		   "data-link": "hihi"
	   });
   });
};