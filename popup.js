import AliasAdditionWidgetGenerator from "/src/widgets/alias-widgets/alias_addition_widget_generator.js";
import AliasFilterWidgetGenerator from "/src/widgets/alias-widgets/alias_filter_widget_generator.js";
import AliasWidgetGenerator from "/src/widgets/alias-widgets/alias_widget_generator.js";
import AliasController from "/src/logic/alias_controller.js"


async function setup() {
  const alias_controller = new AliasController();
  const alias_widget_generator = new AliasWidgetGenerator(alias_controller);
  const alias_filter_widget_generator = new AliasFilterWidgetGenerator(
    alias_controller, alias_widget_generator);
  const alias_addition_widget_generator = new AliasAdditionWidgetGenerator(
    alias_controller, alias_widget_generator);

  alias_addition_widget_generator.create();
  alias_filter_widget_generator.create();
  alias_widget_generator.create_existing_aliases();

  // Request animation frame in order to make sure this happens after DOM creation.
  setTimeout(() => {
    requestAnimationFrame(async () => {
      alias_addition_widget_generator.focus();
    }, 10);
  });
}

window.onload = setup
