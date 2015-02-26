data = {
        'comm' : 'endis',
        'pg' : 0,
        'ss' : 0,
        'av' : 0.2
        }


$(function () {
        document.getElementById("dspg").style.display = "none";
        document.getElementById("dsss").style.display = "none";
});

function get_ip(){
        property=JSON.parse(document.getElementById("property").innerHTML)
        return property.IP
}

function en_1() {
        var IP = get_ip();
        data.comm='endis';
        data.pg=1

document.getElementById("enpg").style.display = "none";
document.getElementById("dspg").style.display = "inline";

        $.ajax({
            type: 'POST',
            data: data,
            dataType: 'text',
            url: '/en/'+IP
        }).done(function( response ) {
        document.getElementById("console").innerHTML = (response);
        });
};

function dis_1() {
        var IP = get_ip();
        data.comm='endis';
        data.pg=0

document.getElementById("enpg").style.display = "inline";
document.getElementById("dspg").style.display = "none";

        $.ajax({
            type: 'POST',
            data: data,
            dataType: 'text',
            url: '/en/'+IP
        }).done(function( response ) {
        
        document.getElementById("console").innerHTML = (response);
        });
};

function en_2() {
        var IP = get_ip();
        data.comm='endis';
        data.ss=1

document.getElementById("enss").style.display = "none";
document.getElementById("dsss").style.display = "inline";

        $.ajax({
            type: 'POST',
            data: data,
            dataType: 'text',
            url: '/en/'+IP
        }).done(function( response ) {
        
        document.getElementById("console").innerHTML = (response);
        });
};

function dis_2() {
        var IP = get_ip();
        data.comm='endis';
        data.ss=0

document.getElementById("enss").style.display = "inline";
document.getElementById("dsss").style.display = "none";

        $.ajax({
            type: 'POST',
            data: data,
            dataType: 'text',
            url: '/en/'+IP
        }).done(function( response ) {
        
        document.getElementById("console").innerHTML = (response);
        });
};

function change_av() {
        var IP = get_ip();
        data.comm='change_av';
        data.av=document.getElementById("AV").value

        $.ajax({
            type: 'POST',
            data: data,
            dataType: 'text',
            url: '/en/'+IP
        }).done(function( response ) {
        
        document.getElementById("console").innerHTML = (response);
        });

old_prop=document.getElementById("property").innerHTML
new_prop=JSON.parse(old_prop)
new_prop.alarm_value=data.av
document.getElementById("property").innerHTML=JSON.stringify(new_prop)
//reload("LiveData");

};


