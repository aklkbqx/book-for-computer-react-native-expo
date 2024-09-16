import { create } from 'twrnc';
const tw = create(require(`@/tailwind.config`));

const twclass = (className: string) => {
    return tw`${className}`
}
export default twclass;