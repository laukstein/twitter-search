(function($) {
    'use strict';

    $.fn.search = function(params) {
        params = $.extend({
            query: null,
            count: 5
        }, params);

        this.each(function() {
            var $t = $(this),
                item = '',
                target = '',
                users = [],
                out = [],
                obj = {},
                i, len, from_user, from_user_name, text,
                screen_name, profile_image_url, name, statuses_count, friends_count, followers_count;

            // Eliminating Duplicates http://dreaminginjavascript.wordpress.com/2008/08/22/eliminating-duplicates/
            function eliminateDuplicates(arr) {
                len = arr.length;

                for (i = 0; i < len; i++) {
                    if (!obj[arr[i]]) {
                        obj[arr[i]] = {};
                        out.push(arr[i]);
                    }
                }

                return out;
            }

            // GET search https://dev.twitter.com/docs/api/1/get/search
            $.ajax({
                url: 'https://search.twitter.com/search.json?q=' + encodeURIComponent(params.query) + '&result_type=recent&rpp=' + params.count + '&callback=?',
                dataType: 'jsonp',
                cache: true,
                jsonpCallback: 'foo',
                beforeSend: function() {
                    $t.html('<li class=item>Loading...');
                },
                success: function(data) {
                    len = data.results.length;

                    for (i = 0; i < len; i++) {
                        from_user = data.results[i].from_user,
                        from_user_name = data.results[i].from_user_name,
                        text = data.results[i].text;

                        users.push(from_user);

                        item += '    <li class="transition item">' +
                            '        <a class=absolute href=#@' + from_user + '></a>' +
                            '        <div class=nowrap><b class=name>' + from_user_name + '</b><span class=user>@' + from_user + '</span></div>' +
                            '        <div class=nowrap>' + text + '</div>' +
                            '    </li>';
                    }

                    $t.html(item);


                    users = eliminateDuplicates(users);
                    users = users.join(',');

                    // GET users/lookup https://dev.twitter.com/docs/api/1/get/users/lookup
                    $.ajax({
                        url: 'https://api.twitter.com/1/users/lookup.json?screen_name=' + users + '&callback=?',
                        dataType: 'jsonp',
                        cache: true,
                        jsonpCallback: 'foo',
                        success: function(data) {
                            len = data.length;

                            for (i = 0; i < len; i++) {
                                screen_name = data[i].screen_name,
                                profile_image_url = data[i].profile_image_url,
                                name = data[i].name,
                                statuses_count = data[i].statuses_count,
                                friends_count = data[i].friends_count,
                                followers_count = data[i].followers_count;

                                target += '        <div id="@' + screen_name + '" class="fixed target">' +
                                    '            <div class="transition content">' +
                                    '                <a class=absolute href=#><span class=close>×</span></a>' +
                                    '                <span class="image cover" style="background-image: url(' + profile_image_url + ');"></span>' +
                                    '                <div class=nowrap><b class=name>' + name + '</b><span class=user>@' + screen_name + '</span></div>' +
                                    '                <div class=nowrap>Tweets <b>' + statuses_count + '</b> Following <b>' + friends_count + '</b> Followers <b>' + followers_count + '</b></div>' +
                                    '            </div>' +
                                    '        </div>';
                            }

                            $t.append('<li>' + target);
                        }
                    });
                },
                error: function(jqXHR, textStatus) {
                    $t.html('<li class=item>' + textStatus);
                }
            });
        });

        return this;
    };
})(jQuery);