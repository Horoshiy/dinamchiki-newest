<script setup lang="ts">
/** Подраздел 7 «Материально-техническое обеспечение. Доступная среда». */
import SvedenPage from '@/widgets/sveden/SvedenPage.vue'
import SvedenBlock from '@/widgets/sveden/SvedenBlock.vue'
import SvedenTable from '@/widgets/sveden/SvedenTable.vue'
import { SPORT_OBJECTS, EQUIPMENT, E_RESOURCES, ACCESSIBILITY, ORG } from '@/entities/sveden/sveden.data'
</script>

<template>
  <SvedenPage
    :num="7"
    title="Материально-техническое обеспечение и оснащённость образовательного процесса. Доступная среда"
    crumb="Материально-техническое обеспечение"
  >
    <SvedenBlock title="Объекты для проведения практических занятий и объекты спорта">
      <div itemprop="purposePrac">
        <SvedenTable caption="Объекты для проведения практических занятий">
          <thead>
            <tr>
              <th>Наименование объекта</th>
              <th>Адрес</th>
              <th class="num">Площадь</th>
              <th class="num">Кол-во</th>
              <th>Доступность для инвалидов</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in SPORT_OBJECTS" :key="o.name">
              <td itemprop="objName">{{ o.name }}</td>
              <td itemprop="objAddress">{{ o.address }}</td>
              <td class="num" itemprop="objSq">{{ o.area }}</td>
              <td class="num" itemprop="objCnt">{{ o.count }}</td>
              <td itemprop="objOvz">{{ o.accessible }}</td>
            </tr>
          </tbody>
        </SvedenTable>
      </div>
      <p class="sv-note" itemprop="purposeSport">
        Перечисленные объекты являются объектами спорта организации.
        Отдельных библиотек и объектов для проведения практики нет.
      </p>
    </SvedenBlock>

    <SvedenBlock title="Средства обучения и воспитания">
      <ul>
        <li v-for="e in EQUIPMENT" :key="e">{{ e }}</li>
      </ul>
    </SvedenBlock>

    <SvedenBlock title="Доступ к информационным системам и сетям">
      <p itemprop="comNet">
        Для педагогических работников обеспечен доступ к сети «Интернет».
        Официальный сайт организации — dinamchiki.ru.
        Доступ обучающихся к информационно-телекоммуникационным сетям
        в процессе занятий не предусмотрен спецификой программ.
      </p>
    </SvedenBlock>

    <SvedenBlock title="Электронные образовательные ресурсы">
      <ul itemprop="erList">
        <li v-for="r in E_RESOURCES" :key="r">{{ r }}</li>
      </ul>
      <p class="sv-note" itemprop="erListOvz">
        Специализированные электронные образовательные ресурсы, приспособленные
        для использования инвалидами и лицами с ограниченными возможностями
        здоровья, не разрабатывались.
      </p>
    </SvedenBlock>

    <SvedenBlock title="Доступная среда">
      <div v-for="a in ACCESSIBILITY" :key="a.title" class="sv-acc">
        <h3 class="sv-acc__title">{{ a.title }}</h3>
        <p :itemprop="a.title === 'Специальные технические средства обучения' ? 'techOvz' : undefined">{{ a.text }}</p>
      </div>
      <p class="sv-note">
        Организация расположена по адресам: {{ ORG.places.join('; ') }}.
        Вопросы обеспечения специальных условий решаются индивидуально.
      </p>
    </SvedenBlock>

    <SvedenBlock title="Общежитие и интернат">
      <p itemprop="hostelInfo">Общежитие отсутствует.</p>
      <p itemprop="interInfo">Интернат отсутствует.</p>
      <p>
        Количество жилых помещений в общежитии — <span itemprop="hostelNum">0</span>,
        в том числе приспособленных для использования инвалидами —
        <span itemprop="hostelNumOvz">0</span>.
        Количество жилых помещений в интернате — <span itemprop="interNum">0</span>,
        в том числе приспособленных —
        <span itemprop="interlNumOvz">0</span>.
      </p>
    </SvedenBlock>
  </SvedenPage>
</template>

<style scoped lang="scss">
.sv-acc {
  padding: $space-4 $space-5;
  border-left: 3px solid $color-brand-200;
  background: $color-bg-soft;
  border-radius: 0 $radius-md $radius-md 0;
}

.sv-acc__title {
  margin: 0 0 $space-2;
  font-size: $font-size-base;
  color: $color-fg-strong;
}

.sv-note { font-size: $font-size-sm; color: $color-fg-muted; }
</style>
