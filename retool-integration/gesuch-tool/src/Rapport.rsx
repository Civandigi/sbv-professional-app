<Screen
  id="Rapport"
  _customShortcuts={[]}
  _hashParams={[]}
  _searchParams={[]}
  browserTitle=""
  title="Rapport"
  urlSlug=""
  uuid="ae175bf6-8214-4f87-8da8-8feb8a9acde3"
>
  <connectResource id="query1" _componentId={null} />
  <RetoolAIAgentInvokeQuery
    id="agentChat1_query1"
    agentInputs="{{ agentChat1.agentInputs }}"
    resourceName="RetoolAIAgentInvokeQuery"
    showSuccessToaster={false}
  />
  <RetoolAIQuery
    id="llmChat1_query1"
    action="chatResponseGeneration"
    chatHistory="{{ llmChat1.messageHistory }}"
    chatInput="{{ llmChat1.lastMessage }}"
    resourceDisplayName="retool_ai"
    resourceName="retool_ai"
  />
  <Include src="./modalFrame1.rsx" />
  <Frame
    id="$main2"
    enableFullBleed={false}
    isHiddenOnDesktop={false}
    isHiddenOnMobile={false}
    padding="8px 12px"
    sticky={null}
    type="main"
  >
    <Container
      id="container4"
      _gap="0px"
      _type="stack"
      footerPadding="4px 12px"
      headerPadding="4px 12px"
      heightType="fixed"
      hidden="{{ cascader2.valuePath == '' }}"
      padding="12px"
      showBody={true}
      showHeader={true}
    >
      <Header>
        <Text
          id="containerTitle3"
          value="#### TP 2 - DigitaleMedien"
          verticalAlign="center"
        />
      </Header>
      <View id="00030" viewKey="View 1">
        <Include src="./container3.rsx" />
      </View>
      <Event
        event="click"
        method="trigger"
        params={{}}
        pluginId="agentChat1_query1"
        type="datasource"
        waitMs="0"
        waitType="debounce"
      />
    </Container>
    <Container
      id="container2"
      footerPadding="4px 12px"
      headerPadding="4px 12px"
      heightType="fixed"
      padding="12px"
      showBody={true}
      showHeader={true}
    >
      <Header>
        <Text
          id="containerTitle2"
          value="#### Rapport"
          verticalAlign="center"
        />
      </Header>
      <View id="00030" viewKey="View 1">
        <Cascader2
          id="cascader2"
          _captionByIndex={["", "", "", "", "", ""]}
          _colorByIndex={["", "", "", "", "", ""]}
          _disabledByIndex={["", "", false, false, false, false]}
          _fallbackTextByIndex={["", "", "", "", "", ""]}
          _hasMigratedNestedItems={true}
          _hiddenByIndex={["", "", false, false, false, false]}
          _iconByIndex={["", "", "", "", "", ""]}
          _ids={["dcc59", "00030", "deefc", "572bb", "444cf", "08dc0"]}
          _imageByIndex={["", "", "", "", "", ""]}
          _keyByIndex={["6dc9f", "Pants-TEMPLATE_DEFAULT", "", "b8b77", "", ""]}
          _labels={["", "", "", "", "TP2_DigitaleMedien", ""]}
          _parentKeyByIndex={[
            "",
            "",
            "Pants-TEMPLATE_DEFAULT",
            "Pants-TEMPLATE_DEFAULT",
            "Pants-TEMPLATE_DEFAULT",
            "Pants-TEMPLATE_DEFAULT",
          ]}
          _tooltipByIndex={["", "", "", "", "", ""]}
          _values={[
            "2023",
            "2024",
            "Übersicht",
            "TP1",
            "TP2_DigitaleMedien",
            "TP3_Messen & Ausstellungen",
          ]}
          emptyMessage="No options"
          hidden=""
          itemMode="static"
          label="Jahr"
          labelPosition="top"
          labelWrap={true}
          overlayMaxHeight={375}
          placeholder="Select an option"
        >
          <Event
            event="change"
            method={null}
            params={{}}
            pluginId=""
            type="widget"
            waitMs="0"
            waitType="debounce"
          />
        </Cascader2>
      </View>
    </Container>
  </Frame>
</Screen>
