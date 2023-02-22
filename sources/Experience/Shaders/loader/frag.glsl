uniform float uAlpha;
uniform float uColor;

void main()
{
    gl_FragColor = vec4(vec3(uColor), uAlpha);
}