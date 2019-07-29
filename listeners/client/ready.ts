import { CustomListener } from '../../classes/listener';

export default class extends CustomListener {
	public async exec(): Promise<void> {
		console.log(this.client.user!.tag);
	}
}
