function togglePopoverModule(modules) {
    var isOldIE = (document.all && !document.addEventListener) === true;
    var addEventListener = modules.addEventListener;

    function toggleStyle(element, popoverShow, callback) {
        var toggleAttribute = popoverShow ? "false" : "true";
        element.setAttribute("show", toggleAttribute);
        if (isOldIE) {
            element.style.display = (popoverShow ? "none" : "inline-block");
        }
        if (popoverShow) {
            callback();
        }
    }

    function togglePopover(element) {
        var togglePopoverId = element.getAttribute("toggle-popover");
        var togglePopover = document.querySelector(togglePopoverId);
        var popoverShow = true;
        var options = {
            afterHide: function() {
            }
        };
        var hideIndex = 0;
        addEventListener(element, "click", function(){
            popoverShow = (togglePopover.getAttribute("show") == "true");
            toggleStyle(togglePopover, popoverShow, function() {
                options.afterHide();
            });
        });
        addEventListener(document, "click", function(e) {
            if (!popoverShow) {
                var event = e || window.event;
                var target = event.target || event.srcElement;
                if (!togglePopover.contains(target) && !element.contains(target)) {
                    toggleStyle(togglePopover, true, function() {
                        options.afterHide();
                    });
                }
            }
        });
        return {
            setOptions: function(o) {
                options = o;
            },
            hide: function() {
                toggleStyle(togglePopover, true, function() {
                    options.afterHide();
                });
            }
        };
    }

    var selectShopper = document.querySelector("#selectShopper");
    return togglePopover(selectShopper);
}

function toggleNoticeModule(modules) {
    var notice = document.querySelector('#notice');
    function toggleShow(element, display) {
        var isHide = false;
        return {
            hide: function() {
                if (!isHide) {
                    isHide = true;
                    element.style.display = "none";
                }
            },
            show: function() {
                if (isHide) {
                    isHide = false;
                    element.style.display = display;
                }
            }
        }
    }
    return toggleShow(notice, "inline-block");
}

function toggleSelectShoppersModule(modules) {
    var addEventListener = modules.addEventListener;
    var selectshoppersDom = document.querySelector('#selectshoppers');
    var selectShoppersCache = {};

    function setSelectShopper(key, value) {
        selectShoppersCache[key] = value;
    }

    function deleteSelectShopper(key) {
        delete selectShoppersCache[key];
    }

    function has(value) {
        for (var key in selectShoppersCache) {
            if (selectShoppersCache[key].name == value) {
                return true;
            }
        }
        return false;
    }

    function ToggleSelectShoppers(element) {
        var template = '<span id="selectShop-@key" class="text--primary selectshopper" key="@id"><span class="center-set"><span class="center-set__item">@name</span><span class="center-set__item deleteShopper">&times;</span></span></span>';

        function removeSelectShopper(node) {
            deleteSelectShopper(node.getAttribute("key"));
            node.remove();
        }

        window.live('deleteShopper', 'click', function(e) {
            var event = e || window.event;
            var target = event.target || event.srcElement;
            removeSelectShopper(target.parentNode.parentNode);
        }, selectshoppersDom);

        return {
            add: function(key, name, adminId) {
                if (!has(name)) {
                    var id = Math.floor( Math.random() * ( 20000 - 0 + 1 ) ) + 0;
                    var str = template.replace('@name', name).replace('@key', id).replace('@id', id);
                    var oldhtml = element.innerHTML;
                    element.innerHTML = oldhtml + str;
                    setSelectShopper(id, {
                        adminId: adminId,
                        name: name
                    });
                    return true;
                } else {
                    return false;
                }
            },
            getAlldata: function() {
                var result = [];
                for (var key in selectShoppersCache) {
                    result.push(selectShoppersCache[key].adminId);
                }
                return result;
            }
        }
    }
    return ToggleSelectShoppers(selectshoppersDom);
}

function PreviewModule(modules) {
    var isOldIE = (document.all && !document.addEventListener) === true;
    var addEventListener = modules.addEventListener;
    var ue = modules.ue;

    var selectShoppers = modules.selectShoppers;

    var togglePreview = document.querySelector('#togglePreview');
    var closePreview = document.querySelector('#closeModal');
    var previewModal = document.querySelector('#previewModal');
    var qrcode = new QRCode(document.getElementById("qrcode"), {
        width : 210,
        height : 210
    });
    var qrcodeLoading = document.querySelector('#qrcodeLoading');

    function toggleOpen(element) {
        var toggleobj = {
            isOpen: false,
            show: show,
            close: close
        };
        function show() {
            toggleobj.isOpen = true;
            element.setAttribute("open", "true");
            if (isOldIE) {
                element.style.display = "block";
            }
        }

        function close() {
            toggleobj.isOpen = false;
            element.setAttribute("open", "false");
            if (isOldIE) {
                element.style.display = "none";
            }
        }
        return toggleobj;
    }

    var togglePreviewModal = toggleOpen(previewModal);
    var toggleqrcodeLoading = toggleOpen(qrcodeLoading);

    function makeCode (text) {
        qrcode.makeCode(text);
    }

    var request = (function() {
        return {
            done: false,
            resolve: function(url, data) {
                return $.post(url, data);
            }
        }
    })();

    function checkNull() {
        var editorTitleInput = document.getElementById('editorTitle');
        var titleValue = $.trim(editorTitleInput.value);
        if (titleValue == '' || $.trim(editorTitleInput.className) != '') {
            alert('一个好的标题是成功的一半');
            return true;
        }
        if ($.trim(ue.getHTML()) == '') {
            alert('没有内容什么呢');
            return true;
        }
        if (selectShoppers.getAlldata().length < 1) {
            alert('商家没有什么呢');
            return true;
        }
        return false;
    }

    var previewModalContent = document.querySelector('#previewModalContent');

    addEventListener(togglePreview, 'click', function() {
        if (checkNull()) {
            return false;
        }

        var sendMsg = {
            articleTitle: document.getElementById('editorTitle').value,
            articleContent: ue.getHTML(),
            merchantId: selectShoppers.getAlldata()
        };

        //console.log(sendMsg);

        var sendMsgConnection = request.resolve(document.getElementById("qrcode").getAttribute('requrt-url'), sendMsg);

        togglePreviewModal.show();
        toggleqrcodeLoading.show();
        sendMsgConnection.success(function(data) {
            request.done = true;
            if (data.state == 1) {
                makeCode(data.articleUrl + Math.random());
                toggleqrcodeLoading.close();
            }
        });
        sendMsgConnection.fail(function() {
            request.done = true;
            toggleqrcodeLoading.close();
            document.getElementById("qrcode").innerHTML = "不好意思 请求超时";
        });
        sendMsgConnection.error(function() {
            request.done = true;
            toggleqrcodeLoading.close();
            document.getElementById("qrcode").innerHTML = "不好意思 请求失败";
        });
    });

    addEventListener(document, 'click', function(e) {
        var event = e || window.event;
        var target = event.target || event.srcElement;
        if (togglePreviewModal.isOpen && previewModal.contains(target) && !previewModalContent.contains(target)) {
            if (target.className != '' && request.done) {
                togglePreviewModal.close();
                //document.getElementById("qrcode").innerHTML = "";
                request.done = false;
            }
        }
    });

    return {};
}

function AutoCompleteListItemModule(modules) {
    var addEventListener = modules.addEventListener;
    var toggleNotice = modules.toggleNotice;
    var selectShoppers = modules.selectShoppers;
    var toggleSelectShopper = modules.toggleSelectShopper;
    var getParents = modules.getParents;
    var autocompleteList = document.querySelector("#autocompleteList");
    var selectShopperInput = document.querySelector('#selectShopperInput');
    var template = '<li list-index="@index"><div class="nav"><div class="nav__item--left shopname" key="@key" admin-id="@adminId">@name</div></div></li>';

    addEventListener(autocompleteList, "click", function(e) {
        var event = e || window.event;
        var target = event.target || event.srcElement;
        if (getParents(target, 'li') && getParents(target, 'li').length > 0) {
            var parent = getParents(target, 'li')[0];
            var index = parseInt(parent.getAttribute("list-index"));
            handleListClicked(target, parent, index);
        }
    });

    function render(name, adminId, index) {
        return template.replace('@name', name).replace('@index', index).replace('@key', index).replace('@adminId', adminId);
    }

    function add(suggestions) {
        var str = '';
        for (var i = 0; i < suggestions.length; i++) {
            str = str + render(suggestions[i].merchantNameCh, suggestions[i].id, i);
        }
        autocompleteList.innerHTML = str;
    }

    function clear() {
        selectShopperInput.value = '';
        autocompleteList.innerHTML = '';
    }

    function handleListClicked(target, parent, index) {
        toggleNotice.hide();
        // 存储shopper信息
        var currentSelectShoper = selectShoppers.add(parent.querySelector('.shopname').getAttribute("key"),
            parent.querySelector('.shopname').innerHTML, parent.querySelector('.shopname').getAttribute('admin-id'));
        setTimeout(function() {
            toggleSelectShopper.hide();
        }, 0);
    }

    return {
        clear: clear,
        add: add
    };
}

function MessageModule(modules) {
    var messageStore = {};
    var addEventListener = modules.addEventListener;
    var messages = document.querySelector("#messages");
    var messageTemplate = document.querySelector("#messageTemplate");
    var renderedMessage = template.compile(messageTemplate.innerHTML);
    var getParents = modules.getParents;

    function addMessage(data) {
        var id = Math.floor( Math.random() * ( 20000 - 0 + 1 ) ) + 0;
        data["xHandlebarsTemplateListId"] = id;
        messageStore[id] = data;
        var message = renderedMessage(data);
        messages.insertAdjacentHTML("beforeend", message);
    }

    function removeMessage(id) {
        delete messageStore[id];
        messages.querySelector("#" + id).remove();
    }

    //addEventListener(messages, "click", function() {
    //    addMessage({
    //        name: "hihi",
    //        state: "已删除"
    //    });
    //});

    //addMessage({
    //    name: "hihi",
    //    state: "已删除"
    //});

    //window.live('message', 'click', function(e) {
    //    var event = e || window.event;
    //    var target = event.target || event.srcElement;
    //    removeMessage(getParents(target, ".message")[0].getAttribute("id"));
    //}, messages);

    return {};
}

function EditorModule(loadComplete) {
    var testEditor;
    var uploadDialog;

    function setDialogLocation(ele, options) {
        var defaults = {
            "data-url": "",
            "data-alt": "",
            "data-link": ""
        };

        var op = $.extend({}, defaults, options);
        ele.attr(op);
    }

    $(function () {
        // 设置图片小图标
        editormd.defaults.toolbarIconsClass["upload"] = "fa-picture-o";

        editormd.toolbarModes["custom"] = [
            "upload",
            "fullscreen"
        ];

        editormd.toolbarHandlers['upload'] = function() {
            this.executePlugin("uploadDialog", "upload-dialog/upload-dialog");
            setTimeout(function() {
                uploadDialog = $("#test-editormd").find(".editormd-upload-dialog");
                window.uploadDialog = uploadDialog;
                if ($.isFunction(window.dialogReady)) {
                    window.dialogReady();
                }
            }, 1200);
        };

        editormd.loadPlugin("/static/edit/editor.md/plugins/upload-dialog/upload-dialog", function(){

            testEditor = editormd("test-editormd", {
                width   : "100%",
                height  : 640,
                syncScrolling : "single",
                path    : "/static/edit/editor.md/lib/",
                toolbarIcons: "custom",
                placeholder: document.getElementById("editorTextarea").getAttribute("placeholder"),
                dialogDraggable: false,
                saveHTMLToTextarea: true,
                toolbarAutoFixed: false,
                onload  : function() {
                }
            });

            loadComplete(testEditor);

        });
    });

    window.setDialogLocation = setDialogLocation;
}

(function(){

    Element.prototype.remove = function() {
        this.parentElement.removeChild(this);
    };
    NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
        for(var i = this.length - 1; i >= 0; i--) {
            if(this[i] && this[i].parentElement) {
                this[i].parentElement.removeChild(this[i]);
            }
        }
    };

    function hasClass(el, className){ return el.classList ? el.classList.contains(className) : new RegExp('\\b'+ className+'\\b').test(el.className); }

    function addEvent(el, type, handler){
        if (el.attachEvent) el.attachEvent('on'+type, handler); else el.addEventListener(type, handler);
    }

    function live(elClass, event, cb, context){
        addEvent(context || document, event, function(e){
            var found, el = e.target || e.srcElement;
            while (el && !(found = hasClass(el, elClass))) el = el.parentElement;
            if (found) cb.call(el, e);
        });
    }
    window.live = live;

    var getParents = function (elem, selector) {

        var parents = [];
        if ( selector ) {
            var firstChar = selector.charAt(0);
        }

        // Get matches
        for ( ; elem && elem !== document; elem = elem.parentNode ) {
            if ( selector ) {

                // If selector is a class
                if ( firstChar === '.' ) {
                    if ( hasClass(elem, selector.substr(1) ) ) {
                        parents.push( elem );
                    }
                }

                // If selector is an ID
                if ( firstChar === '#' ) {
                    if ( elem.id === selector.substr(1) ) {
                        parents.push( elem );
                    }
                }

                // If selector is a data attribute
                if ( firstChar === '[' ) {
                    if ( elem.hasAttribute( selector.substr(1, selector.length - 1) ) ) {
                        parents.push( elem );
                    }
                }

                // If selector is a tag
                if ( elem.tagName.toLowerCase() === selector ) {
                    parents.push( elem );
                }

            } else {
                parents.push( elem );
            }

        }

        // Return parents if any exist
        if ( parents.length === 0 ) {
            return null;
        } else {
            return parents;
        }

    };

    function addEventListener(el, eventName, handler) {
        if (el.addEventListener) {
            el.addEventListener(eventName, handler);
        } else {
            el.attachEvent('on' + eventName, function(){
                return handler.call(el);
            });
        }
    }

    var toggleSelectShopper = togglePopoverModule({
        addEventListener: addEventListener
    });
    var toggleNotice = toggleNoticeModule({
        addEventListener: addEventListener
    });
    var selectShoppers = toggleSelectShoppersModule({
        addEventListener: addEventListener
    });
    var autoCompletemodule = AutoCompleteListItemModule({
        addEventListener: addEventListener,
        getParents: getParents,
        toggleNotice: toggleNotice,
        selectShoppers: selectShoppers,
        toggleSelectShopper: toggleSelectShopper
    });
    var messageCenter = MessageModule({
        addEventListener: addEventListener,
        getParents: getParents
    });

    window.onload = function() {
        var editorContainer = document.querySelector('#editorContainer');
        var paddingV = 28;
        var toolbarHeight = 74;
        var editorFooterHeight = 27;
        var border = 3;


        EditorModule(function(ue) {
            var previewContainer = PreviewModule({
                addEventListener: addEventListener,
                ue: ue,
                selectShoppers: selectShoppers
            });
        });

        var shopperAutoComplete = new autoComplete({
            selector: '#selectShopperInput',
            minChars: 1,
            delay: 0,
            source: function(term, suggest){
                var url = document.getElementById('selectShopperInput').getAttribute('request-url') + "?input=" + term;

                $.post(url, {}, function(data){
                    var choices = data.merchantList;
                    suggest(choices);
                }, 'json');
            },
            renderComplete: function(data, search) {
                autoCompletemodule.add(data);
            }
        });

        toggleSelectShopper.setOptions({
            afterHide: function() {
                autoCompletemodule.clear();
                // 清除上次搜索结果
                shopperAutoComplete.clear();
            }
        });
    };

})();