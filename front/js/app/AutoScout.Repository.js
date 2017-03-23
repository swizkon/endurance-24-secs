var AutoScout = window['AutoScout'] || {};


AutoScout.Repository = function(name) {

    var list = {
        title: name,
        timestamp: new Date().getTime(),
        items: []
    };

    list.name = function(){
        return this.title;
    };

    list.addItem = function(name) {
        this.items[this.items.length] = {name: name, quant: 1};
    };
    
    return list;
};