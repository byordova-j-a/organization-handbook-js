import '~/assets/main.css';
import ActionButton from '~/components/ui/action-button/index';
import InputField from '~/components/ui/input-field/index';
import PageSwitcher from '~/components/ui/page-switcher';
import TableRow from '~/components/ui/table-row/index';
import TableHandbook from '~/components/entities/table-handbook';
import ControllerComponent from '~/components/widgets/controller-component';
import OrganizationForm from '~/components/widgets/organization-form';

customElements.define('action-button', ActionButton);
customElements.define('input-field', InputField);
customElements.define('page-switcher', PageSwitcher);
customElements.define('table-row', TableRow);
customElements.define('table-handbook', TableHandbook);
customElements.define('controller-component', ControllerComponent);
customElements.define('organization-form', OrganizationForm);
