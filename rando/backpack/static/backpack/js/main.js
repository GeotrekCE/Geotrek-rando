(function () {
    var backpack;

    $(window).on('view:ui', function () {
        backPack = new BackPack();
    });

    $(window).on('view:home view:detail', init);

    function popover() {
        var $button = $('#global-backpack');

        $button.popover({
            animation: false,
            html: true,
            placement: 'left',
            trigger: 'manual',
            title: '',
            content: ''
        });

        var _popover = $button.data('popover');

        $button.on('shown', function () {
            refresh(_popover);
        });


        $button.off('click').on('click', function () {
            $button.toggleClass('active');
            $button.popover('toggle');

            // Prevent to go outside screen
            if (_popover.tip().position().top < 0) {
                _popover.tip().css('top', '0px');
            }
        });

        // Close on navigation
        $(window).on('view:leave', function (e) {
            // Close share panel (if open)
            $button.popover('hide');
            $button.removeClass('active');
        });

        return _popover;
    }

    function init() {

        // Refresh initially and on backpack change
        var _popover = popover();
        $(window).on("backpack:change", function () {
            refresh(_popover);
        });
        refresh(_popover);

        //
        // On detail page, show button as active if favorited
        var $detailBackpack = $(".detail-content .btn.backpack"),
            trekId = $detailBackpack.data('id');
        if (window.backPack.contains(trekId))
            $detailBackpack.addClass('active');
        else
            $detailBackpack.removeClass('active');

        //
        // Add/remove from results list
        $('.btn.backpack').on('click', function (e) {
            var trekid = $(this).data('id'),
                trekname = $(this).data('name');
            if (backPack.contains(trekid)) {
                backPack.remove(trekid);
                $(this).removeClass('active');
                // Track event
                _gaq.push(['_trackEvent', 'Backpack', 'Remove', trekname]);
            }
            else {
                backPack.save(trekid);
                $(this).addClass('active');
                _gaq.push(['_trackEvent', 'Backpack', 'Add', trekname]);
            }
        });
    }

    function refresh(popover) {

        // Refresh popover content
        popover.tip().find('.popover-content').html(render());

        // Change buttons in results list
        $('#results .result').each(function () {
            var $trek = $(this),
                trekId = $trek.data('id');
            if (window.backPack.contains(trekId)) {
                $trek.find('.btn.backpack').addClass('active')
                                           .attr('title', gettext('Remove from favorites'))
                                           .removeClass('icon-backpack-add')
                                           .addClass('icon-backpack-remove');
            }
            else {
                $trek.find('.btn.backpack').removeClass('active')
                                           .attr('title', gettext('Add to favorites'))
                                           .removeClass('icon-backpack-remove')
                                           .addClass('icon-backpack-add');
            }
        });

        // Refresh label with number of items
        var $counter = $('#global-backpack span.count');
        var nbfavorited = backPack.items().length;
        $counter.html(nbfavorited);
        if (nbfavorited) {
            $counter.addClass('label-warning');
        }
        else {
            $counter.removeClass('label-warning');
        }

        //
        // Remove from popover
        $('.backpack-items-list a.backpack-remove').off('click').click(function (e) {
            var id = $(this).parent().data('id');
            backPack.remove(id);
            e.preventDefault();
        });
    }

    function render() {
        var html = '<div class="backpack-items-list">';
        var items = backPack.items();
        var i = 0;

        for (n=items.length; i<n; i++) {
            var id = items[i];
            var $result = $('#trek-' + id);

            if (!$result.data('id')) {
                console.warn('TODO: Backpack not working if landing on detail page');
                continue;
            }

            var tpl = '<li data-id="{id}"><a href="{href}" class="pjax">{name}</a> ({duration}) <a href="#" class="close backpack backpack-remove">x</a></li>';
            html += L.Util.template(tpl, {
                id: id,
                href: $result.data('url'),
                name: $result.data('name'),
                duration: $result.data('duration-pretty')
            });
        }
        if (i == 0) {
            return '<p id="noresult">' + gettext('Empty') + '</p>';
        }

        html += '</div>';
        return html;
    }


    function BackPack() {
        this._items = [];
        this.load();
    }

    BackPack.prototype = {
        load: function() {
            try {
                this._items = JSON.parse(localStorage.getItem('backPack'));
            }
            catch (e) {
                this._items = [];
            }
        },
        save: function (id) {
            if (id && !this.contains(id)) {
                this._items.push(id);
            }
            localStorage.setItem('backPack', JSON.stringify(this._items));
            $(window).trigger("backpack:change");
        },
        remove: function (id) {
            var pos = this._items.indexOf(id);
            if (pos >= 0) {
                this._items.splice(pos, 1);
            }
            this.save();
        },
        contains: function (id) {
            return this._items.indexOf(id) >= 0;
        },
        items: function () {
            return this._items;
        }
    };

})();
