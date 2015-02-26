function getProperty(obj) {
        txt=obj.innerHTML
        info=txt.split(' : ')
        type=info[0];
        IP=info[1].split('-')[0] 
        $.getJSON( '/riv_property/'+type+'/'+IP, function( data ) {
                txt='Revealer PROPERTY: <br>'
                for (key in data) {
                        var value = data[key];
                        txt = txt+'<br>'+key+': '+value;
                }
                txt=txt+'<br><br><a href="/riv/'+data.type+'/'+data.IP+'">link to riv page</a>'
                document.getElementById("tooltip").innerHTML = (txt);
                if (obj.id=='attivo')   document.getElementById("tooltip").style.border= '13px solid greenyellow'
                else if (obj.id=='busy')   document.getElementById("tooltip").style.border= '13px solid orange'
                else if (obj.id=='null')   document.getElementById("tooltip").style.border= '13px solid red'
        })
}

