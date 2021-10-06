import { FontGenerator } from '../../types/generator';
import { FontAssetType } from '../../types/misc';
import { renderTemplate } from '../../utils/template';
import { renderSrcAttribute } from '../../utils/css';
import { TEMPLATES_DIR } from '../../constants';
import { join, dirname, parse } from 'path';
import fs from 'fs';

const generator: FontGenerator<Buffer> = {
  dependsOn: FontAssetType.SVG,

  generate: (options, svg: Buffer) => {
    const filename = parse(options.pathOptions.scss).name;
    let generateSrc: boolean | undefined;
    if (options?.formatOptions?.scss?.splitFontSrcToOtherFile) {
      generateSrc = false;
      renderTemplate(
        join(TEMPLATES_DIR, 'scss_fontSrc.hbs'),
        { ...options, fontSrc: renderSrcAttribute(options, svg) },
        { helpers: { codepoint: str => str.toString(16) } }
      ).then(response => {
        const path = join(
          dirname(options.pathOptions.scss),
          `${filename}_fontSrc.scss`
        );
        fs.writeFileSync(path, response);
      });
    }
    console.log(options.formatOptions.scss.generateClasses)
    return renderTemplate(
      options.templates.scss,
      {
        ...options,
        generateClasses: options.formatOptions.scss.generateClasses,
        fontSrc: renderSrcAttribute(options, svg),
        generateSrc,
        filename
      },
      { helpers: { codepoint: str => str.toString(16) } }
    );
  }
};

export default generator;
