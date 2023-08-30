import { SvgIcon } from '@mapzone/icon';
import { ReactComponent as layerLegendSvg } from '@/assets/svg/layer-legend.svg';
import { ReactComponent as menuHomeSvg } from '@/assets/svg/menu-home.svg';
import { ReactComponent as menuScSvg } from '@/assets/svg/menu-sc.svg';
import { ReactComponent as menuBzglSvg } from '@/assets/svg/menu-bzgl.svg';
import { ReactComponent as menuScglSvg } from '@/assets/svg/menu-scgl.svg';
import { ReactComponent as menuXmglSvg } from '@/assets/svg/menu-xmgl.svg';
import { ReactComponent as menuXtglSvg } from '@/assets/svg/menu-xtgl.svg';
import { ReactComponent as menuXntbglSvg } from '@/assets/svg/menu-xxtbgl.svg';
import { ReactComponent as menuZhyajglSvg } from '@/assets/svg/menu-zhyajgl.svg';
import { ReactComponent as menuZyglSvg } from '@/assets/svg/menu-zygl.svg';

import type { SvgIconProps, FsFC } from '@mapzone/types';

type BaseIconProps = Omit<SvgIconProps, 'component'>;

export const LayerLegend: FsFC<BaseIconProps> = (props) => <SvgIcon component={layerLegendSvg} {...props} />;

export const MenuHomeIcon: FsFC<BaseIconProps> = (props) => <SvgIcon component={menuHomeSvg} {...props} />;
export const MenScIcon: FsFC<BaseIconProps> = (props) => <SvgIcon component={menuScSvg} {...props} />;
export const MenScglIcon: FsFC<BaseIconProps> = (props) => <SvgIcon component={menuScglSvg} {...props} />;
export const MenuBzglIcon: FsFC<BaseIconProps> = (props) => <SvgIcon component={menuBzglSvg} {...props} />;
export const MenXmglIcon: FsFC<BaseIconProps> = (props) => <SvgIcon component={menuXmglSvg} {...props} />;
export const MenXtglIcon: FsFC<BaseIconProps> = (props) => <SvgIcon component={menuXtglSvg} {...props} />;
export const MenXntbglIcon: FsFC<BaseIconProps> = (props) => <SvgIcon component={menuXntbglSvg} {...props} />;
export const MenZhyajglIcon: FsFC<BaseIconProps> = (props) => <SvgIcon component={menuZhyajglSvg} {...props} />;
export const MenZyglIcon: FsFC<BaseIconProps> = (props) => <SvgIcon component={menuZyglSvg} {...props} />;
