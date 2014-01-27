define(['jquery', 'lodash', 'core/nav', 'core/session', 'components/selectBox', 'components/dropMenu'], function($, _, nav, session){
    'use strict';

    var currentList;

    var klistboardController = {
        
        dispatch : function(){
            var self = this;
            var $klistsBox = $('#klist-selector');
            var current = session.isset('klist') ? session.get('klist') : false;
            
            this.getLists(function gotLists(lists){
            
                var items = _.map(lists, function(list, index){
                    return {
                        id : index,
                        value: list,
                        state : (current === list || (current === false && index === 0)) ? 'selected' : 'selectable' 
                    };
                });                
                 
                $klistsBox.on('selected.selectBox', function(e, item){
                    self.getList(item.value);                   
                });
                $klistsBox.selectBox({
                    items : items,
                    add : function(cb){
                        var size =  $('.selectbox-item').length - 1;
                        return cb({
                            id : size,
                            value : 'Klist ' + size,
                            state: 'selectable'
                        });
                    }
                });
            });
        },

        getLists : function(cb){
            var url = 'klists';
            nav.api(url, cb);
        },

        getList : function(name){
            var url = 'klist/' + name;
            nav.api(url, function(list){
                $('#klist').find("[data-bind='title']").text(list.title);
                $('#klist').find("[data-bind='desc']").text(list.desc);

                $('#klist-status').dropMenu(); 
            });
        }
    };

    return klistboardController;

});
