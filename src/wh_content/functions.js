// functions
var lastNote = 0;
var statusUpdate = function (){
    var req = new Request({
        url: '?m=info',
        onSuccess: function (text, xml){
            var server = xml.getElementsByTagName('server')[0];
            var serverAttr = server.attributes;

            for(var a=0 ; a<serverAttr.length; a++){
                if(serverAttr[a].nodeName == 'last_note'){
                    if(server.getAttribute(serverAttr[a].nodeName) > lastNote){
                        lastNote = Number(server.getAttribute(serverAttr[a].nodeName));

                        new Request.HTML({
                            url:'?m=get_notes',
                            update: 'server-notes',
                            onSuccess: Ajaxify
                        }).send();
                    }
                } else {
                    var tmp = $('server-'+serverAttr[a].nodeName);
                    if(tmp){
                        tmp.innerHTML = unescape(server.getAttribute(serverAttr[a].nodeName));
                    }
                }
            }
        }
    }).send();
}

var show = function (id){
    var sections = $$('div.section');
    for(var i=0; i<sections.length; i++){
        sections[i].style.display = sections[i].id == id ? 'block' : 'none';
    }
    window.location.hash='#'+id;
}

var Ajaxify = function (){
    className = 'ajax';
    success   = Ajaxify;
    var aj = $$('.'+className);

    for(var i=0; i<aj.length; i++){
        aj[i].removeClass(className);
        aj[i].addEvent('click', function (e){
            e.stop();
            var opt = {
                url:this.getAttribute('href'),
                update: this.getAttribute('update'),
                onSuccess: success
            };
            new Request.HTML(opt).send();
        });
    }

}

window.addEvent('domready', function (){
    statusUpdate();
    var statusInterval = setInterval('statusUpdate()', 3500);

    $('cmd-form').addEvent('submit', function (e){
        e.stop();
        var console = $('console-content');
        var cmd     = $('cmd');

        switch (cmd.value){
            case 'cls':
            case 'clear':
                console.innerHTML = '';
                break;
            case '':
                break;
            default:
                this.set('send', {onSuccess: function (text){
                    $('console-content').innerHTML += text;
                    $('console-content').scrollTo(0, $('console-content').getScrollHeight())
                }});
                this.send();
                break;
        }
        cmd.value = '';
    });

    $('console-content').addEvent('click', function (){$('cmd').focus();});
    if(window.location.hash.search(/db-section/i) > 5){
        document.getElementById("right").innerHTML = "";
        document.getElementById("left").innerHTML = "";
    }
    Ajaxify();
    $('note-form').addEvent('submit', function (e){
        e.stop();
        var notes = $('notes');
        if(notes.value){
            this.set('send', {
                onSuccess: function (text){
                    $('server-notes').innerHTML = text;
                    Ajaxify('.ajax', Ajaxify);
                }
            });
            this.send();
            notes.value= '';
        }
    });

    if(window.location.hash){
        show(window.location.hash.replace(/#/, ''));
    }

    $('file-contents').addEvent('dblclick', function (e){
        if(e.control){
            this.empty();
        }
    });

});