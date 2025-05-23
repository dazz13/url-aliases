import AliasAdditionWidgetGenerator from "/src/widgets/alias-widgets/alias_addition_widget_generator.js";
import AliasFilterWidgetGenerator from "/src/widgets/alias-widgets/alias_filter_widget_generator.js";
import AliasWidgetGenerator from "/src/widgets/alias-widgets/alias_widget_generator.js";
import SortWidget from "/src/widgets/sort_widget.js"
import AliasController from "/src/logic/alias_controller.js"

let previouslyFocusedElement = null;
export default previouslyFocusedElement;

async function setup() {
  document.addEventListener('focus', (event) => {
        previouslyFocusedElement = event.target;
    }, true);
  const alias_controller = new AliasController();
  const alias_widget_generator = new AliasWidgetGenerator(alias_controller);
  const alias_filter_widget_generator = new AliasFilterWidgetGenerator(
    alias_controller, alias_widget_generator);
  const alias_addition_widget_generator = new AliasAdditionWidgetGenerator(
    alias_controller, alias_widget_generator);
  const sort_widget = new SortWidget(alias_widget_generator);
  sort_widget.create();
  alias_addition_widget_generator.create();
  alias_filter_widget_generator.create();
  alias_widget_generator.create_existing_aliases();

  // Request animation frame in order to make sure this happens after DOM creation.
  setTimeout(() => {
    requestAnimationFrame(async () => {
      alias_addition_widget_generator.focus();
    }, 1);
  });
}

window.onload = setup

