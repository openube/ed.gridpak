$(function() {

    /**
     * Grid model
     *
     * @attribute (int) min_width
     * @attribute (int) col_num
     * @attribute (int) col_padding_width
     * @attribute (string) col_padding_width_type
     * @attribute (int) col_margin_width
     * @attribute (string) col_margin_type
     * @attribute (int) baseline_height
     * @attribute (int) current_width DO WE NEED THIS??
     * @attribute (int) lower
     * @attribute (int) upper
     */
    window.Grid = Backbone.Model.extend({

        defaults: {
            min_width: 960,
            col_num: 10,
            col_padding_width: 10,
            col_padding_type: 'px',
            col_margin_width: 10,
            col_margin_type: 'px',
            baseline_height: 22,
            col_width: 56,
            current_width: 960,
            lower: 0,
            upper: false
        },

        updateWidth: function() {
            var old_width = $('#new_min_width').val(),
                current_width = (typeof App != 'undefined') ? App.getWidth() : this.get('min_width'),
                col_width = 0,
                col_padding = 0,
                col_margin = 0;

            // ensure we only fire every time we snap to a new width
            if (old_width == current_width) {
                return false;
            }

            // fixed percentage width padding
            if (this.get('col_padding_type') == 'px') {
                col_padding = this.get('col_padding_width');
            // work the width from percentages
            } else {
                col_padding = Math.floor((current_width / 100) * this.get('col_padding_width'));
            }

            // fixed with margins
            if (this.get('col_margin_type') == 'px') {
                col_margin = this.get('col_margin_width');
            } else {
                col_margin = Math.floor(((current_width / 100) * this.col_margin_width));
            }

            col_width = Math.floor((current_width / this.get('col_num')) - (col_margin * 2) - (col_padding * 2));

            this.set({ 
                col_width: col_width,
                current_width: current_width
            });

        },

    });

    /**
     * Grid collection
     *
     */
    window.GridList = Backbone.Collection.extend({

        model: Grid,

        url: '/',

        comparator: function(grid)
        {
            return grid.get('min_width');
        },

    });

    // Use prototyping to add a check for the next and previous models
    // then assign the lower and upper limits accordingly
    GridList.prototype.add = function(grid) {

        // TODO
        // Find the index the model WOULD be inserted at
        // the lower will be the prev's upper and the upper will be the next's lower

        Backbone.Collection.prototype.add.call(this, grid);
    };

    window.Grids = new GridList([
        { min_width: 320, col_num: 4, col_padding_width: 5, col_padding_type: 'px', col_margin_width: 5,  col_margin_type: 'px', baseline_height: 22, lower: 0, upper: 600 },
        { min_width: 600, col_num: 8, col_padding_width: 5, col_padding_type: 'px', col_margin_width: 5,  col_margin_type: 'px', baseline_height: 22, lower: 600, upper: 960 },
        { min_width: 960, col_num: 10, col_padding_width: 5, col_padding_type: 'px', col_margin_width: 5,  col_margin_type: 'px', baseline_height: 22, lower: 960, upper: false },
    ]);

    /**
     * Grid info view
     *
     */
    window.GridView = Backbone.View.extend({

        tagName: 'li',

        template: _.template($('#grid_template').html()),

        initialize: function() {
            this.model.bind('change', this.render, this);
            this.model.bind('destroy', this.remove, this);
            Grids.fetch();
        },

        events: {
            'click .remove' : 'clear',
            'click .update' : 'updateOptions',
            'resize .grid' : 'updateWidths'
        },

        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            this.stringify();
            return this;
        },

        updateWidths: function() {
            this.model.updateWidth();
        },

        stringify: function() {
            $('#stringified').val(JSON.stringify(Grids));
        },

        updateOptions: function() {
            this.model.set({
                min_width: this.$('.min_width').val(),
                col_num: this.$('.col_num').val(),
                col_padding_width: this.$('.col_padding_width').val(),
                col_padding_type: this.$('.col_padding_type').val(),
                col_margin_width: this.$('.col_margin_width').val(),
                col_margin_type: this.$('.col_margin_type').val(),
                baseline_height: this.$('.baseline_height').val()
            });
        },

        remove: function() {
            $(this.el).remove();
        },

        clear: function() {
            this.model.destroy();
        }

    });

    /**
     * The application
     *
     */
    window.AppView = Backbone.View.extend({

        $browser: {},
        snap: 20,

        el: $('#gridpak'),

        events: {
            'click #save_grid': 'createGrid'
        },

        initialize: function() {
            var that = this;

            this.input = this.$('#create_grid');
            this.$browser = $('#browser').resizable({
                handles: { e: $(".dragme") },
                grid: this.snap,
                minWidth: 300,
                resize: function(e, ui) {
                    $('.grid').trigger('resize');
                    $('#new_min_width').val(that.getWidth()); 
                }
            });

            Grids.each(function(grid) {
                that.addGrid(grid);
            });

            Grids.bind('add', this.addOne, this);
        },

        getWidth: function() {
            return Math.round(this.$browser.innerWidth() / this.snap) * this.snap;
        },

        addGrid: function(grid) {
            var view = new GridView({ model: grid });
            this.$('#grid_list').append(view.render().el);
        },

        createGrid: function(e) {

            var new_grid = new Grid({
                min_width: $('#new_min_width').val(),
                col_num: $('#new_col_num').val(),
                col_width: false,
                col_padding_width: $('#new_col_padding_width').val(),
                col_padding_type: $('#new_col_padding_type').val(),
                col_margin_width: $('#new_col_margin_width').val(),
                col_margin_type: $('#new_col_margin_type').val(),
                baseline_height: $('#new_baseline_height').val()
            });

            Grids.add(new_grid);
        },

        addOne: function(grid) {
            var view = new GridView({ model: grid });
            this.$('#grid_list').append(view.render().el);
        }

     });

     window.App = new AppView;

});
