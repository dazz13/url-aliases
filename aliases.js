import AliasAdditionWidgetGenerator from "/src/widgets/alias-widgets/alias_addition_widget_generator.js";
import AliasWidgetGenerator from "/src/widgets/alias-widgets/alias_widget_generator.js";
import AliasController from "/src/logic/alias_controller.js"


function setup() {
  let alias_controller = new AliasController();

  let alias_widget_generator = new AliasWidgetGenerator(alias_controller);
  let alias_addition_widget_generator = new AliasAdditionWidgetGenerator(alias_controller, alias_widget_generator);

  alias_addition_widget_generator.create();
  alias_widget_generator.create_existing_aliases();
  // Request animation frame in order to make sure this happens after DOM creation.
  requestAnimationFrame(() => {
    alias_addition_widget_generator.focus();
  });
}

window.onload = setup
